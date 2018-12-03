import Web3 from 'web3'

import ABI from './ABI.json'

const contractAddress = '0xC24EcEB8CDC97C1C00327AdFD3928F763702e636'
const zeroAddress = '0x0000000000000000000000000000000000000000'

const web3 = new Web3('https://rpc.truedapp.net')
const contract = new web3.eth.Contract(ABI, contractAddress)

class Work {
  constructor (id) {
    this.id = id
    this.owner = '...'
    this.name = '...'
    this.intro = ''
    this.permonth = '...'
    this.permanent = '...'
    this.updated = false
    this.update()
  }
  update () {
    if (this.owner === '...' || this.owner === zeroAddress) {
      contract.methods.workByID(this.id).call().then(res => {
        this.owner = res.owner
        this.name = res.item
        this.intro = res.intro
        this.permonth = res.permonth
        this.permanent = res.permanent
        this.updated = new Date()
      }).catch(() => {
        this.updated = false
      })
    }
    return this
  }
}
const cache = new Map()
function findOrCreateWorkInfo (id) {
  const fromCache = cache.get(id)
  if (fromCache) {
    return fromCache.update()
  } else {
    const work = new Work(id)
    cache.set(id, work)
    return work
  }
}

const defaultUser = [
  { priKey: '0x01', address: '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf' },
  { priKey: '0x02', address: '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF' },
  { priKey: '0x03', address: '0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69' },
  { priKey: '0x04', address: '0x1efF47bc3a10a45D4B230B5d10E37751FE6AA718' }
]
defaultUser.forEach(account => {
  const ac = web3.eth.accounts.privateKeyToAccount(account.priKey)
  web3.eth.accounts.wallet.add(ac)
})

export default {
  namespaced: true,
  state: {
    utils: web3.utils,
    abi: web3.eth.abi,
    methods: contract.methods,

    state: 0,
    name: '...',

    userIndex: 0,
    contractAddress
  },
  getters: {
    address (state) {
      return defaultUser[state.userIndex].address
    },
    addressByIndex: _ => index => {
      return defaultUser[index].address
    }
  },
  mutations: {
    updateNetworkState (state, name) {
      if (name) {
        state.name = name
        state.state = 1
      } else {
        state.name = '...'
        state.state = 2
      }
    }
  },
  actions: {
    checkNetwork ({ commit, dispatch }) {
      contract.methods.name().call().then(res => {
        commit('updateNetworkState', res)
      }).catch(() => {
        commit('updateNetworkState', false)
        setTimeout(() => {
          dispatch('checkNetwork')
        }, 3000)
      })
    },
    updateUser ({ state }, index) {
      state.userIndex = index
    },
    getWork (_, id) {
      return findOrCreateWorkInfo(id)
    },
    async getRegisteredWorks ({ state, dispatch }, address) {
      address = address || defaultUser[state.userIndex].address
      return contract.methods.worksOf(address).call().then(res => {
        return res.map(id => {
          return findOrCreateWorkInfo(id)
        })
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
    },
    async registerWork ({ state, dispatch }, {
      item,
      intro,
      permonth,
      permanent
    }) {
      const address = defaultUser[state.userIndex].address
      return contract.methods.registerWork(
        item,
        intro,
        permonth,
        permanent
      ).send({
        from: address,
        gasPrice: 1,
        gas: 3000000
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
    }
  }
}
