"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Gift, Coffee, Pizza, Utensils, Cake } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function LoyaltyPage() {
  const { user } = useAuth()
  const loyaltyPoints = user?.loyaltyPoints || 0

  // Mock rewards data
  const rewards = [
    {
      id: 1,
      name: "Free Dessert",
      description: "Get a free dessert with your next order",
      points: 100,
      icon: <Cake className="h-8 w-8" />,
      available: loyaltyPoints >= 100,
    },
    {
      id: 2,
      name: "Free Drink",
      description: "Get a free drink with your next meal",
      points: 150,
      icon: <Coffee className="h-8 w-8" />,
      available: loyaltyPoints >= 150,
    },
    {
      id: 3,
      name: "10% Off",
      description: "Get 10% off your next order",
      points: 200,
      icon: <Utensils className="h-8 w-8" />,
      available: loyaltyPoints >= 200,
    },
    {
      id: 4,
      name: "Free Pizza",
      description: "Get a free pizza with your next order",
      points: 500,
      icon: <Pizza className="h-8 w-8" />,
      available: loyaltyPoints >= 500,
    },
  ]

  // Mock tiers data
  const tiers = [
    { name: "Bronze", threshold: 0, benefits: ["Earn 1 point per $1 spent", "Birthday reward"] },
    {
      name: "Silver",
      threshold: 200,
      benefits: ["Earn 1.5 points per $1 spent", "Free dessert on birthday", "Priority reservations"],
    },
    {
      name: "Gold",
      threshold: 500,
      benefits: ["Earn 2 points per $1 spent", "Free meal on birthday", "Priority reservations", "Exclusive events"],
    },
    {
      name: "Platinum",
      threshold: 1000,
      benefits: [
        "Earn 3 points per $1 spent",
        "Free meal on birthday",
        "VIP reservations",
        "Exclusive events",
        "Personal chef experience",
      ],
    },
  ]

  // Determine current tier
  const currentTier = tiers.reduce((prev, curr) => {
    return loyaltyPoints >= curr.threshold ? curr : prev
  }, tiers[0])

  // Determine next tier
  const nextTierIndex = tiers.findIndex((tier) => tier.name === currentTier.name) + 1
  const nextTier = nextTierIndex < tiers.length ? tiers[nextTierIndex] : null

  // Calculate progress to next tier
  const progressToNextTier = nextTier
    ? Math.min(((loyaltyPoints - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100, 100)
    : 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Loyalty Program</h1>
        <p className="text-gray-500">Earn points and redeem rewards</p>
      </div>

      {/* Loyalty Status */}
      <Card>
        <CardHeader>
          <CardTitle>Your Loyalty Status</CardTitle>
          <CardDescription>Current points and tier information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center sm:flex-row sm:items-start sm:justify-between">
            <div className="mb-6 flex flex-col items-center sm:mb-0">
              <div className="mb-2 rounded-full bg-blue-100 p-4 text-blue-900">
                <Award className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-semibold">{loyaltyPoints} Points</h3>
              <p className="text-sm text-gray-500">Current Balance</p>
            </div>

            <div className="flex flex-col items-center sm:items-end">
              <h3 className="text-2xl font-semibold">{currentTier.name} Tier</h3>
              <p className="text-sm text-gray-500">Current Status</p>

              {nextTier && (
                <div className="mt-4 w-full max-w-xs">
                  <div className="mb-2 flex justify-between text-xs">
                    <span>{currentTier.name}</span>
                    <span>{nextTier.name}</span>
                  </div>
                  <Progress value={progressToNextTier} className="h-2" />
                  <p className="mt-2 text-center text-xs text-gray-500">
                    {nextTier.threshold - loyaltyPoints} more points to reach {nextTier.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Available Rewards</CardTitle>
          <CardDescription>Redeem your points for these rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`rounded-lg border p-4 text-center ${
                  reward.available ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white">
                  <div
                    className={`rounded-full p-3 ${
                      reward.available ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {reward.icon}
                  </div>
                </div>
                <h3 className={`text-lg font-medium ${reward.available ? "text-gray-900" : "text-gray-500"}`}>
                  {reward.name}
                </h3>
                <p className={`mb-3 text-sm ${reward.available ? "text-gray-600" : "text-gray-400"}`}>
                  {reward.description}
                </p>
                <div className="mb-3 text-lg font-semibold text-blue-900">{reward.points} Points</div>
                <Button
                  variant={reward.available ? "default" : "outline"}
                  className="w-full"
                  disabled={!reward.available}
                >
                  {reward.available ? "Redeem" : `Need ${reward.points - loyaltyPoints} more`}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Tiers</CardTitle>
          <CardDescription>Benefits for each loyalty tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${
                  tier.name === currentTier.name ? "border-blue-200 bg-blue-50 ring-1 ring-blue-500" : "border-gray-200"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-medium">{tier.name}</h3>
                  {tier.name === currentTier.name && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      Current
                    </span>
                  )}
                </div>
                <p className="mb-4 text-sm text-gray-500">{tier.threshold}+ points</p>
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <span className="mr-2 mt-0.5 text-blue-500">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            Points are earned on all purchases. 1 point is awarded for every $1 spent.
          </p>
        </CardFooter>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Learn about our loyalty program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-900">
                <Utensils className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Earn Points</h3>
              <p className="text-sm text-gray-500">
                Earn points every time you dine with us or order delivery. The more you spend, the more points you earn.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-900">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Reach Tiers</h3>
              <p className="text-sm text-gray-500">
                As you accumulate points, you'll progress through our loyalty tiers, unlocking more benefits along the
                way.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-900">
                <Gift className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Redeem Rewards</h3>
              <p className="text-sm text-gray-500">
                Use your points to redeem exclusive rewards, from free desserts to complimentary meals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
