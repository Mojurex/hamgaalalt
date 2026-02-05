export default function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      {message}
    </div>
  );
}
