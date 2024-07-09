import { Field, SmartContract, state, State, method } from 'o1js';

export class AllergyChecker extends SmartContract {
  @state(Field) allergenListHash = State<Field>();

  init() {
    super.init();
    this.allergenListHash.set(Field(0)); // Initial value, will be updated during deployment
  }

  @method async updateAllergenHash(newHash: Field) {
    this.allergenListHash.set(newHash);
  }

  @method async verifyAllergen(inputHash: Field) {
    const storedHash = this.allergenListHash.get();
    this.allergenListHash.requireEquals(storedHash);
    inputHash.assertEquals(storedHash);
  }
}
