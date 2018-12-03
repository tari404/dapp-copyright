pragma solidity ^0.5.0;

contract Copyright {
  struct Work {
    address owner;
    string item;
    string intro;
    uint256 permonth;
    uint256 permanent;
  }

  string public constant name = "Copyright Trading App";
  string public constant symbol = "CTA";
  uint64 constant MAX_TIME = uint64(0) - 1;

  address payable public founder;
  mapping (address => uint256) private balance;

  mapping (address => bytes32[]) private usersWorks;
  mapping (bytes32 => Work) private works;
  mapping (uint256 => bytes32) private allWorks;
  uint256 private totalWorksCount;

  mapping (bytes32 => mapping (address => uint64)) private validity;

  event NewWork(address indexed owner, bytes32 id);
  event Authorize(address indexed user, bytes32 indexed id, uint64 sustained);

  constructor () public {
    founder = msg.sender;
  }

  function balanceOf (address _user) public view returns (uint256) {
    return balance[_user];
  }
  function worksOf (address _user) public view returns (bytes32[] memory) {
    return usersWorks[_user];
  }
  function workByID (bytes32 _id) public view returns (
    address owner,
    string memory item,
    string memory intro,
    uint256 permonth,
    uint256 permanent
  ) {
    Work storage work = works[_id];
    owner = work.owner;
    item = work.item;
    intro = work.intro;
    permonth = work.permonth;
    permanent = work.permanent;
  }
  function worksPaged (uint256 _page, uint256 _size) public view returns (bytes32[] memory owner, uint8 count) {
    uint256 start = _page * _size;
    require(_size < 30);
    owner = new bytes32[](_size);
    for (count = 0; count < _size; count++) {
      uint256 i = start + count;
      if (i >= totalWorksCount) {
        break;
      }
      owner[count] = allWorks[i];
    }
  }
  function validityOf (address _user, bytes32 _id) public view returns (uint64) {
    return validity[_id][_user];
  }

  function deposite () public payable {
    balance[msg.sender] += msg.value;
  }
  function take (uint256 _value) public {
    require(_value <= balance[msg.sender]);
    balance[msg.sender] -= _value;
    msg.sender.transfer(_value);
  }

  function registerWork (
    string memory _item,
    string memory _intro,
    uint256 _permonth,
    uint256 _permanent
  ) public {
    bytes32[] storage existing = usersWorks[msg.sender];
    bytes32 workID = keccak256(abi.encodePacked(msg.sender, existing.length));
    existing.push(workID);
    Work memory newWork = Work({
      owner: msg.sender,
      item: _item,
      intro: _intro,
      permonth: _permonth,
      permanent: _permanent
    });
    works[workID] = newWork;
    allWorks[totalWorksCount] = workID;
    totalWorksCount++;
    validity[workID][msg.sender] = MAX_TIME;
    emit NewWork(msg.sender, workID);
    emit Authorize(msg.sender, workID, MAX_TIME);
  }

  function buyAuthorizationPerMonth (bytes32 _workID, uint64 _month) public payable {
    Work storage work = works[_workID];
    require(work.owner != address(0));
    uint256 totalSpend = _month * work.permonth;
    assert(totalSpend / _month == work.permonth);
    uint64 time = _month * 30 days;
    assert(time / _month == 30 days);
    balance[msg.sender] += msg.value;
    _authorize(_workID, time, work.owner, msg.sender, totalSpend);
  }
  function buyAuthorizationPermanent (bytes32 _workID) public payable {
    Work storage work = works[_workID];
    require(work.owner != address(0));
    balance[msg.sender] += msg.value;
    _authorize(_workID, MAX_TIME, work.owner, msg.sender, work.permanent);
  }

  function _authorize (
    bytes32 _workID,
    uint64 _time,
    address _owner,
    address _purchaser,
    uint256 _pay
  ) private {
    require(_pay <= balance[_purchaser]);
    balance[_owner] += _pay;
    balance[_purchaser] -= _pay;
    uint64 existing = validity[_workID][_purchaser];
    if (existing < now) {
      existing = uint64(now);
    }
    uint64 sustained = existing + _time;
    if (sustained < existing) {
      validity[_workID][_purchaser] = MAX_TIME;
      emit Authorize(_purchaser, _workID, MAX_TIME);
    } else {
      validity[_workID][_purchaser] = sustained;
      emit Authorize(_purchaser, _workID, sustained);
    }
  }
}