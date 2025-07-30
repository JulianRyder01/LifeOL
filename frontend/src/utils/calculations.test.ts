// Test file to verify the new EXP system
import { getExpForLevel, calculateLevel } from './calculations';

// Test the EXP requirements for each level
console.log('Testing EXP requirements for each level:');
for (let level = 1; level <= 10; level++) {
  console.log(`Level ${level}: ${getExpForLevel(level)} EXP`);
}

// Test level calculation based on EXP
console.log('\nTesting level calculation based on EXP:');
const testExpValues = [0, 25, 50, 75, 100, 125, 150, 200, 300, 500];
testExpValues.forEach(exp => {
  console.log(`${exp} EXP: Level ${calculateLevel(exp)}`);
});