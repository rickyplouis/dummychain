export const UserContainer = (props) => (
  <div style={{width: '20vw', height: '100vh', textAlign: 'left', marginLeft: '5vw'}}>
    <div>
      <Header as="h2">
        Users
      </Header>
      {props.children}
    </div>
  </div>
)
