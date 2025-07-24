interface LogoProps {
  variant: "header" | "login"
  className?: string
}

export function Logo({ variant, className = "" }: LogoProps) {
  const logoSrc =
    variant === "header"
      ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20Header-xxqeUAkWpJ4b8Y1lNgztw6fy3bIDzG.png"
      : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20Login-NNzhB8ktjb13qS2JwOkKvQIoHZc1K5.png"
  const altText = "PackOne Logo"

  return (
    <img
      src={logoSrc || "/placeholder.svg"}
      alt={altText}
      className={className}
      width={variant === "header" ? 120 : 120}
      height={variant === "header" ? 32 : 32}
      onError={(e) => {
        console.error("Logo failed to load:", logoSrc)
        e.currentTarget.style.display = "none"
      }}
    />
  )
}
