export default function FormSuccess({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
      {message}
    </div>
  );
}
