import React from 'react'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

import PageContainer from '../components/pageContainer'

import { Header, Form, Button, Input, Label } from 'semantic-ui-react'
import Head from 'next/head';
import { Tree } from '@vx/hierarchy';
import { hierarchy, stratify } from 'd3-hierarchy';
import { LinearGradient } from '@vx/gradient';
import * as Block from '../components/block'
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
      tree: [
        {name: 'Genesis', type: 'block', parent: ''},
        {name: 'A', type: 'block', parent: 'Genesis', color: 'yellow'},
        {name: 'A1', type: 'user', parent: 'A'},
        {name: 'A2', type: 'user', parent: 'A'},
        {name: 'B', type: 'block', parent: 'A'},
        {name: 'C', type: 'block', parent: 'B'},
        {name: 'C1', type: 'user', parent: 'C'},
        {name: 'C2', type: 'user', parent: 'C'}
      ]
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

  convertToTree = (array) => {
    return hierarchy(stratify().id(function(d) { return d.name; }).parentId(function(d) { return d.parent; })(array));
  }

  renderTree = () => {
    return (<svg width={'100vw'} height={'100vh'}>
          <LinearGradient id="lg" from="#fd9b93" to="#fe6e9e" />
          <rect
            width={'100vw'}
            height={'100vh'}
            rx={14}
            fill="#272b4d"
          />
          <Tree
            top={10}
            left={30}
            root={this.convertToTree(this.state.tree)}
            size={[
              800,
              1000
            ]}
            nodeComponent={Block.Node}
            linkComponent={Block.Link}
          />
        </svg>
      )
  }

  logTree = (e) => {
    e.preventDefault();
    console.log('hierarchy before convert', this.state.tree);
    console.log('hierarchy after convert', this.convertToTree(this.state.tree));
  }
  addNode = () => {
    let tree = this.state.tree;
    tree.push({name: 'A3', type: 'user', parent: 'A'})
    this.setState({
      ...this.state,
      tree
    })
  }

  renderChain = () => {
      return (
        <div style={{margin: '0 auto', display: 'table'}}>
          <Header as="h2">In Chain {this.state.chain.chainName}</Header>
          <Form>
            <Form.Button content="Log hierarchy" onClick={(e) => this.logTree(e)}/>
            <Form.Button content="Add Node" onClick={(e) => this.addNode(e)}/>
          </Form>
          {this.renderTree()}
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
      <div style={{width: '100vw', height: '100vh', textAlign: 'center'}}>
        <Head>
          <link rel='stylesheet' href='//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.2/semantic.min.css'/>
        </Head>
        {this.renderPage()}
      </div>
    )
  }
}
