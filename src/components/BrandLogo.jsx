export default function BrandLogo({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-8 w-24",
    md: "h-10 w-32",
    lg: "h-16 w-48",
    wide: "h-8 w-28",
    hero: "h-9 w-28",
  }

  return (
    <img
      src="/milogit-logo.png?v=2"
      alt="MILOGIT"
      className={`object-contain ${sizes[size] || sizes.md} ${className}`}
    />
  )
}
