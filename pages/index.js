import React from 'react'
import Router from 'next/router'
import { Button, Header, Container, Icon } from 'semantic-ui-react'

import PageContainer from '../components/pageContainer'

const handler = (path) => {
  Router.push({
    pathname: path
  })
}

export default class HomePage extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      text: "Hello from state"
    }
  }

  render(){
    return (
      <PageContainer>
        <div style={{marginTop: '10vh'}}>
          <Header as="h1" color={'purple'}>Learn The Chain <Icon name="chain" color={'black'}/></Header>
          <Header as="h2">Simple web visualization of Blockchain</Header>
          <br/>
          <Button basic color={"purple"} onClick={() => handler('/makeChain')}>Make A Chain</Button>
          <Button basic color={"black"} onClick={() => handler('/joinChain')}>Join A Chain</Button>
        </div>
      </PageContainer>
    )
  }
}
