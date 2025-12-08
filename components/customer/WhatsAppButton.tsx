'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  phoneNumber: string
  message?: string
  variant?: 'default' | 'floating' | 'inline'
  className?: string
}

export default function WhatsAppButton({ 
  phoneNumber, 
  message = '', 
  variant = 'default',
  className = ''
}: WhatsAppButtonProps) {
  // Format phone number (remove any non-numeric characters except +)
  const formattedPhone = phoneNumber.replace(/[^\d+]/g, '')
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`

  const baseStyles = "inline-flex items-center gap-2 font-semibold transition-all duration-200 hover:scale-105"
  
  const variantStyles = {
    default: "bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 shadow-lg",
    floating: "fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 z-40",
    inline: "bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
      <span className={variant === 'floating' ? 'hidden sm:inline' : ''}>
        {variant === 'floating' ? 'WhatsApp' : 'Inquire on WhatsApp'}
      </span>
    </a>
  )
}

