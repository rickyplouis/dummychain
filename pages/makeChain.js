import { Component } from 'react';
import io from 'socket.io-client';
import Router from 'next/router';
import PageContainer from '../components/pageContainer';
import { Form, Button, Header, Checkbox } from 'semantic-ui-react';

const uuidv1 = require('uuid/v1');

export default class MakeChain extends Component {
  // fetch old messages data from the server

  static defaultProps = {
    chains: []
  }

  constructor(props){
    super(props);
    this.state = {
      chains: this.props.chains,
      chainName: '',
      agenda: []
    }

    this.handleForm = this.handleForm.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // connect to WS server and listen event
  componentDidMount () {
    this.socket = io()
    this.socket.on('makeChain', this.loadChains)
  }

  // close socket connection
  componentWillUnmount () {
    this.socket.off('makeChain', this.loadChains)
    this.socket.close()
  }

  // add messages from server to the state
  loadChains = (chain) => {
    this.setState(state => ({ chains: state.chains.concat(chain) }))
  }

  //Form Handlers
  handleForm = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  makeChain(chainID){
    return {
      id: chainID,
      createdAt: new Date(),
      chainName: this.state.chainName,
      agenda: this.state.agenda,
      tree: [
          {name: 'Genesis', type: 'block', parent: '', hash: uuidv1()},
      ],
      users: []
    }
  }

  handleSubmit = event => {
    event.preventDefault()
    let chainID = uuidv1();

    let chain = this.makeChain(chainID)

    this.setState(state => ({
      chains: state.chains.concat(this.makeChain(chain))
    }))

    Router.push({
      pathname: '/chains',
      query: { id: chainID }
    })

    // send object to WS server
    this.socket.emit('makeChain', chain)
  }

  disableSubmit(){
    return this.state.chainName.length === 0;
  }

  render () {
    return (
      <PageContainer>
          <Form onSubmit={this.handleSubmit} style={{marginTop: '10vh', marginLeft: '30vw', marginRight:'30vw'}}>
            <Header as="h2">Make A Chain</Header>
            <Form.Field style={{textAlign:'left'}}>
              <label>Enter The Name of The Chain To Create</label>
              <Form.Input
                onChange={this.handleForm}
                type='text'
                placeholder='The Simplest Chain'
                name="chainName"
                value={this.state.chainName}
                />
            </Form.Field>
            <Form.Field>
              <Button disabled={this.disableSubmit()} style={{width: '20vw'}}>Create Chain</Button>
            </Form.Field>
        </Form>
      </PageContainer>
    )
  }
}
