import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TablePickerProps {
  value?: string[];
  onChange: (tableIds: string[]) => void;
  availableTables: Array<{
    _id: string;
    tableNumber: string;
    status: 'available' | 'reserved' | 'occupied';
    capacity: number;
  }>;
  guestCount: number;
  className?: string;
}

export function TablePicker({
  value = [],
  onChange,
  availableTables,
  guestCount,
  className
}: TablePickerProps) {
  const [selectedTables, setSelectedTables] = useState<string[]>(value);
  const [totalSelectedCapacity, setTotalSelectedCapacity] = useState(0);

  useEffect(() => {
    // Calculate total capacity of selected tables
    const capacity = selectedTables.reduce((total, tableId) => {
      const table = availableTables.find(t => t._id === tableId);
      return total + (table?.capacity || 0);
    }, 0);
    setTotalSelectedCapacity(capacity);
  }, [selectedTables, availableTables]);

  const handleTableClick = (e: React.MouseEvent, tableId: string) => {
    e.preventDefault(); // Prevent form submission
    let newSelectedTables: string[];
    
    if (selectedTables.includes(tableId)) {
      // Deselect table
      newSelectedTables = selectedTables.filter(id => id !== tableId);
    } else {
      // Select table if we haven't met guest capacity yet
      const table = availableTables.find(t => t._id === tableId);
      const newCapacity = totalSelectedCapacity + (table?.capacity || 0);
      
      if (newCapacity <= guestCount + 4) { // Allow some buffer for flexibility
        newSelectedTables = [...selectedTables, tableId];
      } else {
        return; // Don't select if it would exceed needed capacity by too much
      }
    }
    
    setSelectedTables(newSelectedTables);
    onChange(newSelectedTables);
  };

  const getTableStatus = (table: TablePickerProps['availableTables'][0]) => {
    if (table.status === 'reserved') {
      return {
        text: 'Reserved',
        color: 'text-red-500',
        bgColor: 'bg-red-50 border-red-200',
        icon: '🔒'
      };
    }
    
    if (table.status === 'occupied') {
      return {
        text: 'Occupied',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50 border-orange-200',
        icon: '👥'
      };
    }
    
    if (selectedTables.includes(table._id)) {
      return {
        text: `Selected (${table.capacity} seats)`,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: '✓'
      };
    }
    
    return {
      text: `Available (${table.capacity} seats)`,
      color: 'text-green-500',
      bgColor: 'bg-green-50 border-green-200',
      icon: '✓'
    };
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        {totalSelectedCapacity < guestCount ? (
          <span className="text-amber-600">
            Please select more tables - Need seating for {guestCount} guests, currently selected capacity: {totalSelectedCapacity}
          </span>
        ) : (
          <span className="text-green-600">
            Selected tables can accommodate {totalSelectedCapacity} guests
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {availableTables.map((table) => {
          const status = getTableStatus(table);
          return (
            <Button
              key={table._id}
              type="button"
              variant={selectedTables.includes(table._id) ? "default" : "outline"}
              disabled={table.status === 'reserved' || table.status === 'occupied'}
              onClick={(e) => handleTableClick(e, table._id)}
              className={cn(
                "h-24 w-full p-4 flex flex-col items-center justify-center space-y-2 border-2 transition-all",
                selectedTables.includes(table._id) && "bg-primary text-primary-foreground",
                !selectedTables.includes(table._id) && status.bgColor,
                (table.status === 'reserved' || table.status === 'occupied') && "opacity-75 cursor-not-allowed"
              )}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg font-medium">Table {table.tableNumber}</span>
                <span className="text-lg">{status.icon}</span>
              </div>
              <span className={cn("text-sm font-medium", status.color)}>
                {status.text}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
} 