pragma solidity ^0.5.0;

contract Copyright {
  struct Work {
    address owner;
    string item;
    string intro;
  }
  struct Price {
    bool onSale;
    uint256 permonth;
    uint256 permanent;
  }

  string public constant name = "Copyright Trading App";
  string public constant symbol = "CTA";
  uint64 constant MAX_TIME = uint64(0) - 1;

  address payable public founder;
  mapping (address => uint256) private _balance;

  mapping (address => bytes32[]) private _usersWorks;
  mapping (bytes32 => Work) private _works;
  bytes32[] private _allWorks;

  mapping (bytes32 => Price) private _prices;
  mapping (bytes32 => bool) private _onShop;
  bytes32[] private _shop;

  mapping (bytes32 => mapping (address => uint64)) private _validity;

  mapping (address => bytes32[]) private _boughtWorks;
  mapping (address => mapping(bytes32 => bool)) private _everBought;

  event NewWork(address indexed owner, bytes32 id);
  event Authorize(address indexed user, bytes32 indexed id, uint64 sustained);

  constructor () public {
    founder = msg.sender;
  }

  function balanceOf (address _user) public view returns (uint256) {
    return _balance[_user];
  }
  function worksOf (address _user) public view returns (bytes32[] memory) {
    return _usersWorks[_user];
  }
  function boughtWorksOf (address _user) public view returns (bytes32[] memory) {
    return _boughtWorks[_user];
  }
  function workByID (bytes32 _id) public view returns (
    address owner,
    string memory item,
    string memory intro,
    bool onSale,
    uint256 permonth,
    uint256 permanent
  ) {
    Work storage work = _works[_id];
    Price storage price = _prices[_id];
    owner = work.owner;
    item = work.item;
    intro = work.intro;
    onSale = price.onSale;
    permonth = price.permonth;
    permanent = price.permanent;
  }
  function worksPaged (uint256 _page, uint256 _size) public view returns (bytes32[] memory works, uint8 count) {
    uint256 start = _page * _size;
    require(_size < 30);
    works = new bytes32[](_size);
    uint256 length = _shop.length;
    for (count = 0; count < _size; count++) {
      uint256 i = start + count;
      if (i >= length) {
        break;
      }
      works[count] = _allWorks[i];
    }
  }
  function totalWorksCount () public view returns (uint256) {
    return _allWorks.length;
  }
  function shopPaged (uint256 _page, uint256 _size) public view returns (bytes32[] memory works, uint8 count) {
    uint256 start = _page * _size;
    require(_size < 30);
    works = new bytes32[](_size);
    uint256 length = _shop.length;
    for (count = 0; count < _size; count++) {
      uint256 i = start + count;
      if (i >= length) {
        break;
      }
      works[count] = _shop[i];
    }
  }
  function shopSize () public view returns (uint256) {
    return _shop.length;
  }
  function validityOf (address _user, bytes32 _id) public view returns (uint64) {
    return _validity[_id][_user];
  }

  function deposite () public payable {
    _balance[msg.sender] += msg.value;
  }
  function take (uint256 _value) public {
    require(_value <= _balance[msg.sender]);
    _balance[msg.sender] -= _value;
    msg.sender.transfer(_value);
  }

  function registerWork (
    string memory _name,
    string memory _intro
  ) public {
    bytes32[] storage existing = _usersWorks[msg.sender];
    bytes32 workID = keccak256(abi.encodePacked(msg.sender, existing.length));
    existing.push(workID);
    Work memory newWork = Work({
      owner: msg.sender,
      item: _name,
      intro: _intro
    });
    _works[workID] = newWork;
    _allWorks.push(workID);
    _validity[workID][msg.sender] = MAX_TIME;
    emit NewWork(msg.sender, workID);
    emit Authorize(msg.sender, workID, MAX_TIME);
  }

  function onShelves (
    bytes32 _workID,
    uint256 _permonth,
    uint256 _permanent
  ) public {
    Work storage work = _works[_workID];
    require(work.owner == msg.sender);
    Price memory price = Price({
      onSale: true,
      permonth: _permonth,
      permanent: _permanent
    });
    _prices[_workID] = price;
    if (!_onShop[_workID]) {
      _onShop[_workID] = true;
      _shop.push(_workID);
    }
  }

  function pullOff (bytes32 _workID) public {
    Work storage work = _works[_workID];
    require(work.owner == msg.sender);
    Price storage price = _prices[_workID];
    price.onSale = false;
  }

  function buyAuthorizationPerMonth (bytes32 _workID, uint64 _month) public payable {
    Price storage price = _prices[_workID];
    require(price.onSale);
    uint256 totalSpend = _month * price.permonth;
    assert(totalSpend / _month == price.permonth);
    uint64 time = _month * 30 days;
    assert(time / _month == 30 days);
    _balance[msg.sender] += msg.value;
    _authorize(_workID, time, msg.sender, totalSpend);
  }
  function buyAuthorizationPermanent (bytes32 _workID) public payable {
    Price storage price = _prices[_workID];
    require(price.onSale);
    _balance[msg.sender] += msg.value;
    _authorize(_workID, MAX_TIME, msg.sender, price.permanent);
  }

  function _authorize (
    bytes32 _workID,
    uint64 _time,
    address _purchaser,
    uint256 _pay
  ) private {
    address owner = _works[_workID].owner;
    require(owner != address(0));
    require(_pay <= _balance[_purchaser]);
    _balance[owner] += _pay;
    _balance[_purchaser] -= _pay;
    uint64 existing = _validity[_workID][_purchaser];
    if (existing < now) {
      existing = uint64(now);
    }
    uint64 sustained = existing + _time;
    if (sustained < existing) {
      _validity[_workID][_purchaser] = MAX_TIME;
      emit Authorize(_purchaser, _workID, MAX_TIME);
    } else {
      _validity[_workID][_purchaser] = sustained;
      emit Authorize(_purchaser, _workID, sustained);
    }
    if (!_everBought[_purchaser][_workID]) {
      _everBought[_purchaser][_workID] = true;
      _boughtWorks[_purchaser].push(_workID);
    }
  }
}