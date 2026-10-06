import Button from '../components/Button';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-5xl font-bold">Page not found</h1>
      <p className="mt-4 text-soil-600">That page does not exist. It may have moved, or the link is wrong.</p>
      <Button to="/" className="mt-8">Back to home</Button>
    </section>
  );
}
