import React from 'react'
import Router from 'next/router'
import PageContainer from '../components/pageContainer'
import { Form, Button, Header } from 'semantic-ui-react'

export default class JoinChain extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      text: "Hello from JoinChain.js",
      inputID: ""
    }
  }

  handleRouter = event => {
    event.preventDefault();
    Router.push({
      pathname: '/chains',
      query: { id: this.state.inputID}
    })
  }

  handleID = event =>  {
    this.setState({
      inputID: event.target.value
    })
  }

  disableSubmit(){
    return this.state.inputID.length == 0
  }

  render(){
    return (
      <PageContainer>
        <Form onSubmit={this.handleRouter}  style={{marginTop: '10vh', marginLeft: '30vw', marginRight:'30vw'}}>
          <Header as="h2">Join A Chain</Header>
          <Form.Group>
            <Form.Input
              onChange={this.handleID}
              type='text'
              placeholder='Enter Your Chain ID'
              value={this.state.inputID}
              width={16}
              />
            <Button disabled={this.disableSubmit()}>Send</Button>
          </Form.Group>
        </Form>
      </PageContainer>
    )
  }
}
