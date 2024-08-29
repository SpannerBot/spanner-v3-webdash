export default function BigPage() {
  return (
    <div className={"bigPage"}>
      <h1>Big Page</h1>
      <p>This is a big page.</p>
      <hr/>
      <div style={{marginTop: "100vh"}}></div>
      <div style={{marginTop: "100vh"}}></div>
      <div style={{marginTop: "100vh"}}></div>
      <div style={{marginTop: "100vh"}}></div>
      <div style={{marginTop: "100vh"}}></div>
      <div>
        <div>
          <code>
            {"meow:3 ".repeat(100000)}
          </code>
        </div>
      </div>
    </div>
  )
}