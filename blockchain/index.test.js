const Blockchain = require('./index');
const Block = require('./block');
const cryptoHash = require('../utilities/crypto-hash');



describe('Blockchain',()=>{
  let blockchain,newChain,originalChain;

  beforeEach(()=>{
    blockchain = new Blockchain();
    newChain =  new Blockchain();

    originalChain = blockchain.chain;
  })

  it('contains a `chain` array',()=>{
      expect(blockchain.chain instanceof Array).toBe(true);
  });

  it('starts with a genesis Block',()=>{
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it('adds a new block ',()=>{
      const newData = 'foo-bar';
      blockchain.addBlock({data: newData});
      expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
  });

  describe('isValidChain()',()=>{
    describe('when the chain does not start with genesis',()=>{
      it('returns false',()=>{
        blockchain.chain[0] = {data : 'fake-geneis'};
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });

    });

    describe('when the chain start with genesis and has multiple blocks',()=>{
      beforeEach(()=>{
        blockchain.addBlock({data: 'Bears'});
        blockchain.addBlock({data: 'Beets'});
        blockchain.addBlock({data: 'Battlestar Galactica'});
      });

      describe('and a lastHash reference has changed',()=>{
          it('returns false',()=>{
            blockchain.chain[2].lastHash = 'broken-lastHash';
            expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
          });
      });

      describe('and the chain contains block with invalid field',()=>{
         it('returns false',()=>{
           blockchain.chain[2].data = 'some evil data';
           expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
         });
      });

      describe('and the chain containes a block with jump difficulty',()=>{
        it('returns false',()=>{
          const lastBlock = blockchain.chain[blockchain.chain.length-1];
          const lastHash = lastBlock.hash;
          const timestamp = Date.now();
          const nonce = 0;
          const data = [];
          const difficulty = lastBlock.difficulty - 3;
          const hash = cryptoHash(timestamp, lastHash, nonce, difficulty, data );
          const badBlock = new Block({
            timestamp,
            lastHash,
            nonce,
            difficulty,
            data
          });

          blockchain.chain.push(badBlock);

          expect (Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain does not contains any invalid bloc',()=>{
         it('returns true',()=>{
           expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
         });
      });


    });
  });

  describe('replaceChain()',()=>{
    describe('when the new chain is not longer',()=>{
      it('does not replace the chain',()=>{
          newChain.chain[0] = {new:'chain'};
          blockchain.replaceChain(newChain.chain);

          blockchain.replaceChain(newChain.chain);

          expect(blockchain.chain).toEqual(originalChain);
      });
    });

    describe('when the new chain is longer',()=>{
      beforeEach(()=>{
        newChain.addBlock({data: 'Bears'});
        newChain.addBlock({data: 'Beets'});
        newChain.addBlock({data: 'Battlestar Galactica'});
      });


      describe('and chain is invalid',()=>{
        it('does not replace the chain',()=>{
          newChain.chain[2].hash = 'some fake hash';
          blockchain.replaceChain(newChain.chain);
          expect(blockchain.chain).toEqual(originalChain);
        });
      });

      describe('and chain is valid',()=>{
        it(' replace the chain',()=>{
          blockchain.replaceChain(newChain.chain);
          expect(blockchain.chain).toEqual(newChain.chain);
        });
      });
    });
  });
});
