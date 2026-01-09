export function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toISOString().split('T')[0];
//   return date.toLocaleDateString("en-US", {
//     day: "2-digit",
//     month: "long",
//     year: "numeric",
//   })
}