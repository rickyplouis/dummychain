import { hierarchy, stratify } from 'd3-hierarchy';
const uuidv1 = require('uuid/v1');


var chainController = {
  chainIsEmpty(chain){
    return Object.keys(chain).length === 0 && chain.constructor === Object
  },
  convertToTree(array){
    return hierarchy(stratify().id(function(d) { return d.hash; }).parentId(function(d) { return d.parent; })(array));
  },
  findDeepestBlock(tree){
    for (let x = tree.length - 1; x > -1; x--){
      if (tree[x].type === 'block'){
        return tree[x]
      }
    }
    return;
  },
  makeBlock (deepestBlock, type, name) {
    return {
      name: name,
      type: type,
      parent: deepestBlock.hash,
      hash: uuidv1()
    }
  },
  makeNewTree(chain){
    let tree = chain.tree,
        users = chain.users,
        deepestBlock = this.findDeepestBlock(tree),
        newBlock = this.makeBlock(deepestBlock, 'block', 'block' + parseInt(Math.random() * 1000))

    tree.push(newBlock);
    for (let user of users){
      tree.push(this.makeBlock(newBlock, 'user', user.username))
    }
    return tree
  }
}

module.exports = chainController
