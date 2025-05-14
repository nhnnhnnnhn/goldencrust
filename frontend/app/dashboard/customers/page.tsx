"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserPlus, MoreHorizontal, Award } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGetAllUsersQuery, useSearchUsersQuery, User } from "@/redux/api/userApi"

export default function CustomersPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  // Real data from backend
  const { 
    data: customers, 
    isLoading, 
    error 
  } = useGetAllUsersQuery(undefined)

  // Search functionality using the API
  const { 
    data: searchResults,
    isLoading: isSearching 
  } = useSearchUsersQuery(searchQuery, {
    skip: !searchQuery // Only search when there's a query
  })

  // Use either search results or all customers
  const displayCustomers = searchQuery ? searchResults : customers

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading customers</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <p className="text-gray-500">Manage and view customer information</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="mt-1 text-3xl font-semibold">{displayCustomers?.length || 0}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-2 text-blue-800">
                <UserPlus className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Customers</p>
                <p className="mt-1 text-3xl font-semibold">
                  {displayCustomers?.filter((c: User) => c.isActive).length || 0}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-2 text-green-800">
                <UserPlus className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">New This Month</p>
                <p className="mt-1 text-3xl font-semibold">
                  {displayCustomers?.filter((c: User) => {
                    const joinDate = new Date(c.createdAt)
                    const now = new Date()
                    return joinDate.getMonth() === now.getMonth() && 
                           joinDate.getFullYear() === now.getFullYear()
                  }).length || 0}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-2 text-purple-800">
                <UserPlus className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Loyalty Members</p>
                <p className="mt-1 text-3xl font-semibold">
                  {displayCustomers?.filter((c: User) => c.loyaltyPoints > 0).length || 0}
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-2 text-amber-800">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>View and manage all customers</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Loyalty Points</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayCustomers?.map((customer: User) => (
                <TableRow key={customer._id}>
                  <TableCell className="font-medium">{customer.fullName}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.loyaltyPoints || 0}</TableCell>
                  <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        customer.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {customer.isActive ? 'active' : 'inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Customer</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete Customer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
