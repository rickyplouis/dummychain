import React from 'react'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

import PageContainer from '../components/pageContainer'

import { Header, Form, Button, Input, Label } from 'semantic-ui-react'
import Head from 'next/head';

export default class ChainPage extends React.Component {

  componentWillReceiveProps(nextProps) {
    const { pathname, query } = nextProps.url
    // fetch data based on the new query
  }

  static async getInitialProps ({ query: { id } }) {
    const appUrl = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/chains' : 'https://robertrules.io/chains';
    const response = await fetch(appUrl)
    const chains = await response.json()
    return { chains }
  }


  static defaultProps = {
    chains: []
  }

  // connect to WS server and listen event
  componentDidMount () {
    this.socket = io()
    this.socket.on('updateChain', this.loadChains)
  }


  // close socket connection
  componentWillUnmount () {
    this.socket.off('updateChain', this.loadChains)
    this.socket.close()
  }

  // only update chain if id matches
  // prevents cross chain updates
  loadChains = (chain) => {
    if (chain.id == this.state.id){
      this.setState(state => ({ chain }))
    }
    return;
  }

  constructor(props){
    super(props);
    let targetChain = {}
    for (let chain of this.props.chains){
      if (chain.id === this.props.url.query.id){
        targetChain = chain;
      }
    }
    this.state = {
      chain: targetChain,
      id: this.props.url.query.id,
      username: '',
      userConnected: false,
    }
  }

  updateChain = (e) => {
    e.preventDefault;
    this.socket.emit('updateChain', this.state.chain)
  }

  handlechainName = (event) => {
    event.preventDefault();
    this.setState({
      ...this.state,
      chain: {
        ...this.state.chain,
        chainName: event.target.value
      }
    })
    this.socket.emit('updateChain', this.state.chain)
  }

  handleUsername = (event) => {
    event.preventDefault();
    this.setState({
      username: event.target.value
    })
  }

  chainIsEmpty = (chain) => {
    return Object.keys(chain).length === 0 && chain.constructor === Object
  }

  renderChain = () => {
      return (
        <div style={{margin: '0 auto', display: 'table'}}>
          <Form>
            <Form.Input type="text" placeholder="Chain Name" value={this.state.chain.chainName} onChange={ (e) => this.handlechainName(e)} />
            <Form.Button content='Submit' onClick={(e) => this.updateChain(e)} />
          </Form>
          <Header as="h2">In Chain {this.state.chain.chainName}</Header>
          <Form>
            <label>My username:</label>
            <Form.Input type="text" placeholder="Enter your name" value={this.state.username} onChange={ (e) => this.handleUsername(e)} />
            <Form.Button content='Submit' />
          </Form>
        </div>
      )
  }

  connectUser = () => {
    this.setState({
      userConnected: true
    })
  }

  submitEntranceForm = (e) => {
    e.preventDefault();
    this.connectUser()
  }

  disableEntranceButton = () => {
    return this.state.username.length === 0;
  }

  renderJoinText = () => {
    return (<Header as="h2"> Enter your name to join</Header>)
  }

  renderEntranceForm(){
    return (
      <div style={{margin: '0 auto', display: 'table'}}>
        {this.renderJoinText()}
        <Form size={'tiny'} onSubmit={(e) => this.submitEntranceForm(e)} >
          <Form.Group>
            <Form.Input placeholder='Enter your name' name='name' value={this.state.username} onChange={ (e) => this.handleUsername(e)} />
            <Form.Button content='Submit' disabled={this.disableEntranceButton()} />
          </Form.Group>
        </Form>
      </div>

    )
  }

  renderPage (){
    if (this.chainIsEmpty(this.state.chain)){
      return <div>No chain available at this id</div>
    }
    else {
      return this.state.userConnected ? <div>{this.renderChain()}</div> : <div>{this.renderEntranceForm()}</div>
    }
  }

  render(){
    return(
      <PageContainer>
        <Head>
          <a href="http://www.freepik.com/free-vector/animal-avatars-in-flat-design_772910.htm">Animal Avatars by Freepik</a>
        </Head>
        {this.renderPage()}
      </PageContainer>
    )
  }
}
