const Block = require('./block');
const cryptoHash = require('../utilities/crypto-hash');





class Blockchain {
      constructor(){
        this.chain = [Block.genesis()];
      }

      addBlock({ data }){
        const newBlock = Block.mineBlock({
          lastBlock: this.chain[this.chain.length-1],
          data
        });

        this.chain.push(newBlock);

      }

      replaceChain(chain) {
        if(chain.length < this.chain.length){
          return;
        }
        if(!Blockchain.isValidChain(chain)){
          return;
        }
        this.chain =chain
      }

      static isValidChain(chain){
          if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
          };

          for(let i=1 ;i<chain.length;i++){
            const {timestamp,lastHash,hash,data,nonce,difficulty} = chain[i];
            const actualLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;

            if(lastHash !== actualLastHash) return false;

            const validateHash = cryptoHash(timestamp, lastHash, data, nonce , difficulty);

            if(hash !== validateHash) return false;

            if(Math.abs(lastDifficulty - difficulty) > 1) return false;
          }
          return true;
      }
}

module.exports = Blockchain;
