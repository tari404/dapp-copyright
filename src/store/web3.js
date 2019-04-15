import Web3 from 'web3true'
import BN from 'bn.js'

import ABI from './ABI.json'
import config from '../../config.json'

const contractAddress = config.contractAddress
const web3 = new Web3(config.web3Provider)
const contract = new web3.eth.Contract(ABI, contractAddress)

class Work {
  constructor (id) {
    this.id = id
    this.createdAt = '...'
    this.owner = '...'
    this.name = '...'
    this.intro = ''
    this.onSale = false
    this.permonth = '...'
    this.permanent = '...'
    this.updated = false
    this.update()
  }
  update () {
    contract.methods.workByID(this.id).call().then(res => {
      this.createdAt = new Date(Number(res.createdAt) * 1000)
        .toLocaleString()
        .replace(/\//g, '-')
      this.owner = res.owner
      this.name = res.item
      this.intro = res.intro
      this.onSale = res.onSale
      this.permonth = res.permonth
      this.permanent = res.permanent
      this.updated = new Date()
    }).catch(() => {
      this.updated = false
    })
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
    worksCount: 0,
    shopSize: 0,

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
    updateUser ({ state, rootState }, index) {
      state.userIndex = index
      rootState.userIndex = index
    },
    getWork (_, id) {
      return findOrCreateWorkInfo(id)
    },
    async updateTotalWorksCount ({ state, dispatch }) {
      return contract.methods.totalWorksCount().call().then(res => {
        state.worksCount = Number(res)
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
    },
    async updateShopSize ({ state, dispatch }) {
      return contract.methods.shopSize().call().then(res => {
        state.shopSize = Number(res)
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
    },
    async getWorksPaged ({ dispatch }, { page, size }) {
      return contract.methods.worksPaged(page, size).call().then(res => {
        const length = Number(res.count)
        const result = []
        for (let i = 0; i < length; i++) {
          result.push(findOrCreateWorkInfo(res.works[i]))
        }
        return result
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
    },
    async getShopPaged ({ dispatch }, { page, size }) {
      return contract.methods.shopPaged(page, size).call().then(res => {
        const length = Number(res.count)
        const result = []
        for (let i = 0; i < length; i++) {
          result.push(findOrCreateWorkInfo(res.works[i]))
        }
        return result
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
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
    async getBoughtWorks ({ state, dispatch }, address) {
      address = address || defaultUser[state.userIndex].address
      return contract.methods.boughtWorksOf(address).call().then(res => {
        return res.map(id => {
          return findOrCreateWorkInfo(id)
        })
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
    },
    async getValidity ({ state, dispatch }, { address, id }) {
      address = defaultUser[state.userIndex].address
      return contract.methods.validityOf(address, id).call().catch(err => {
        dispatch('checkNetwork')
        return err
      })
    },
    async registerWork ({ state, dispatch }, {
      name,
      intro
    }) {
      const address = defaultUser[state.userIndex].address
      return contract.methods.registerWork(
        name,
        intro
      ).send({
        from: address,
        gasPrice: 1000000,
        gas: 3000000
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
    },
    async saleAuthorization ({ state, dispatch }, {
      id,
      permonth,
      permanent
    }) {
      const address = defaultUser[state.userIndex].address
      return contract.methods.onShelves(
        id,
        permonth,
        permanent
      ).send({
        from: address,
        gasPrice: 1000000,
        gas: 3000000
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
    },
    async pullOff ({ state, dispatch }, { id }) {
      const address = defaultUser[state.userIndex].address
      return contract.methods.pullOff(
        id
      ).send({
        from: address,
        gasPrice: 1000000,
        gas: 3000000
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
    },
    async buyAuthorizationPerMonth ({ state, dispatch }, {
      id,
      month,
      permonth
    }) {
      const value = new BN(permonth).muln(month).toString()
      const address = defaultUser[state.userIndex].address
      return contract.methods.buyAuthorizationPerMonth(
        id,
        month
      ).send({
        from: address,
        gasPrice: 1000000,
        gas: 3000000,
        value
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
    },
    async buyAuthorizationPermanent ({ state, dispatch }, {
      id,
      permanent
    }) {
      const address = defaultUser[state.userIndex].address
      return contract.methods.buyAuthorizationPermanent(
        id
      ).send({
        from: address,
        gasPrice: 1000000,
        gas: 3000000,
        value: permanent
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
    }
  }
}
