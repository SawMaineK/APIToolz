export default function App({ name }: any) {
  return (
    <div className="min-h-screen grid place-content-center text-center">
      <h1 className="text-3xl font-bold text-blue-600">Hello {name} 👋</h1>
      <p className="text-gray-500">Edit <code>resources/js/{name}/App.jsx</code> and save to test HMR.</p>
    </div>
  );
}
