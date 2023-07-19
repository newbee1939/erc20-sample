// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

// ERC20トークンのサンプルコード
// 独自のトークン発行時にはこちらに従う
contract ERC20 {
    // 全てのトークンの数
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    address private _owner; 
    // {"99sfs999fsfs": "233434343", "hohosj323j2o23": "3333323235"}
    mapping(address => uint256) private _balances;

    constructor (string memory name_, string memory symbol_, uint8 decimals_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        _owner = msg.sender;
    }

    // externalすると外部からも呼び出せる
    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function decimals() external view returns (uint8) {
        return _decimals;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    // 新しいトークンの発行
    // accountはトークンを受け取るアドレス
    // msg.sender = 関数を呼び出すアドレス
    function mint(address account, uint256 amount) external {
        // オーナーしか新たなトークンを発行できない
        require(msg.sender == _owner, "only contract owner can call mint");
        // 指定されたアカウントがゼロアドレス（つまり空のアドレス）でないことを確認
        require(account != address(0), "mint to zero address is not allowed");
        // 全体に増える
        _totalSupply = _totalSupply + amount; 
        // 指定したアカウントのbalanceも増える
        _balances[account] = _balances[account] + amount;
    }

    // トークンの消滅
    function burn(address account, uint256 amount) external {
        // オーナーしか新たなトークンを発行できない
        require(msg.sender == _owner, "only contract owner can call burn");
        require(account != address(0), "burn from the zero address is not allowed");
        // 指定したアカウントのbalanceも増える
        _balances[account] = _balances[account] - amount;
        // 全体に増える
        _totalSupply = _totalSupply - amount; 
    }
    
}