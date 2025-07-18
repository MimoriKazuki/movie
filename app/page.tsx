export default function HomePage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Movie App - Test Page</h1>
      <p>If you can see this, the deployment is working!</p>
      <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
        Go to Login
      </a>
    </div>
  )
}