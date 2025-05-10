"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

interface GoogleLoginButtonProps {
  onClick?: () => void
  isLoading?: boolean
  className?: string
}

export function GoogleLoginButton({
  onClick,
  isLoading = false,
  className = "",
}: GoogleLoginButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 ${className}`}
    >
      {isLoading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
      ) : (
        <div className="relative h-5 w-5">
          <Image
            src="/images/google-logo.svg"
            alt="Google logo"
            width={20}
            height={20}
            className="absolute inset-0"
          />
        </div>
      )}
      <span>Đăng nhập bằng Google</span>
    </Button>
  )
}
