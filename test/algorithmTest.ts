import assert from "assert";
import { AnswerDifficulty, Flashcard, BucketMap } from "../src/flashcards";
import {
  toBucketSets,
  getBucketRange,
  practice,
  update,
  getHint,
  computeProgress,
} from "../src/algorithm";



/*
 * Testing strategy for toBucketSets():
 * 
 * Partitions:
 * - Empty bucket map
 * - Single bucket with cards
 * - Multiple buckets with different numbers of cards
 * - Buckets with non-consecutive numbers
 * 
 * Coverage:
 * - Test minimum and maximum cases
 * - Verify correct size and content of resulting array
 */
describe("toBucketSets()", () => {
  it("should handle empty bucket map", () => {
    const emptyBuckets: BucketMap = new Map();
    const result = toBucketSets(emptyBuckets);
    assert.deepStrictEqual(result, []);
  });

  it("should convert single bucket with cards", () => {
    const card1 = new Flashcard("Q1", "A1", "Hint1", []);
    const card2 = new Flashcard("Q2", "A2", "Hint2", []);
    const buckets: BucketMap = new Map([
      [0, new Set([card1, card2])]
    ]);
    
    const result = toBucketSets(buckets);
    assert.strictEqual(result.length, 1);
    assert.deepStrictEqual(result[0], new Set([card1, card2]));
  });

  it("should handle non-consecutive bucket numbers", () => {
    const card1 = new Flashcard("Q1", "A1", "Hint1", []);
    const card2 = new Flashcard("Q2", "A2", "Hint2", []);
    const card3 = new Flashcard("Q3", "A3", "Hint3", []);
    
    const buckets: BucketMap = new Map([
      [2, new Set([card1])],
      [5, new Set([card2, card3])]
    ]);
    
    const result = toBucketSets(buckets);
    assert.strictEqual(result.length, 6);
    assert.deepStrictEqual(result[2], new Set([card1]));
    assert.deepStrictEqual(result[5], new Set([card2, card3]));
    assert.deepStrictEqual(result[0], new Set());
    assert.deepStrictEqual(result[1], new Set());
    assert.deepStrictEqual(result[3], new Set());
    assert.deepStrictEqual(result[4], new Set());
  });
});


/*
 * Testing strategy for getBucketRange():
 * 
 * Partitions:
 * - Empty bucket array
 * - Single non-empty bucket
 * - Multiple non-empty buckets
 * - Mixed empty and non-empty buckets
 * 
 * Coverage:
 * - Verify correct minimum and maximum bucket numbers
 * - Handle edge cases like empty input
 * - Check boundary conditions
 */

describe("getBucketRange()", () => {
  it("should return undefined for empty bucket array", () => {
    const emptyBuckets: Array<Set<Flashcard>> = [];
    const result = getBucketRange(emptyBuckets);
    assert.strictEqual(result, undefined);
  });

  it("should return correct range for single non-empty bucket", () => {
    const card = new Flashcard("Q1", "A1", "Hint1", []);
    const buckets: Array<Set<Flashcard>> = [
      new Set(),
      new Set([card])
    ];
    
    const result = getBucketRange(buckets);
    assert.deepStrictEqual(result, { minBucket: 1, maxBucket: 1 });
  });

  it("should return correct range for multiple non-empty buckets", () => {
    const card1 = new Flashcard("Q1", "A1", "Hint1", []);
    const card2 = new Flashcard("Q2", "A2", "Hint2", []);
    const buckets: Array<Set<Flashcard>> = [
      new Set(),
      new Set([card1]),
      new Set(),
      new Set([card2])
    ];
    
    const result = getBucketRange(buckets);
    assert.deepStrictEqual(result, { minBucket: 1, maxBucket: 3 });
  });
});



/*
 * Testing strategy for practice():
 * 
 * Partitions:
 * - Empty bucket array
 * - Day less than bucket array length
 * - Day greater than bucket array length
 * - Multiple buckets with varying numbers of cards
 * 
 * Coverage:
 * - Verify correct cards are selected for practice
 * - Check behavior with different day values
 * - Ensure no unexpected cards are included
 */
describe("practice()", () => {
  it("should return empty set for empty bucket array", () => {
    const emptyBuckets: Array<Set<Flashcard>> = [];
    const result = practice(emptyBuckets, 3);
    assert.deepStrictEqual(result, new Set());
  });

  it("should return cards from buckets up to the specified day", () => {
    const card1 = new Flashcard("Q1", "A1", "Hint1", []);
    const card2 = new Flashcard("Q2", "A2", "Hint2", []);
    const card3 = new Flashcard("Q3", "A3", "Hint3", []);
    
    const buckets: Array<Set<Flashcard>> = [
      new Set([card1]),
      new Set([card2]),
      new Set([card3]),
      new Set()
    ];
    
    const result = practice(buckets, 2);
    assert.deepStrictEqual(result, new Set([card1, card2]));
  });

  it("should handle day greater than bucket array length", () => {
    const card1 = new Flashcard("Q1", "A1", "Hint1", []);
    const card2 = new Flashcard("Q2", "A2", "Hint2", []);
    
    const buckets: Array<Set<Flashcard>> = [
      new Set([card1]),
      new Set([card2])
    ];
    
    const result = practice(buckets, 5);
    assert.deepStrictEqual(result, new Set([card1, card2]));
  });
});

/*
 * Testing strategy for update():
 * 
 * Partitions:
 * - Move card when wrong (decrease bucket)
 * - Keep card in same bucket when hard
 * - Move card when easy (increase bucket)
 * - Card not found in any bucket
 * 
 * Coverage:
 * - Test all difficulty levels
 * - Verify bucket transitions
 * - Check edge cases like first and last buckets
 */

describe("update()", () => {
  const card1 = new Flashcard("Q1", "A1", "Hint1", []);
  const card2 = new Flashcard("Q2", "A2", "Hint2", []);

  it("should move card to previous bucket when wrong", () => {
    const buckets: BucketMap = new Map([
      [2, new Set([card1])]
    ]);
    
    const result = update(buckets, card1, AnswerDifficulty.Wrong);
    assert.deepStrictEqual(result.get(1), new Set([card1]));
    assert.deepStrictEqual(result.get(2), new Set());
  });

  it("should keep card in same bucket when hard", () => {
    const buckets: BucketMap = new Map([
      [2, new Set([card1])]
    ]);
    
    const result = update(buckets, card1, AnswerDifficulty.Hard);
    assert.deepStrictEqual(result.get(2), new Set([card1]));
  });

  it("should move card to next bucket when easy", () => {
    const buckets: BucketMap = new Map([
      [2, new Set([card1])]
    ]);
    
    const result = update(buckets, card1, AnswerDifficulty.Easy);
    assert.deepStrictEqual(result.get(3), new Set([card1]));
    assert.deepStrictEqual(result.get(2), new Set());
  });

  it("should handle card not found in any bucket", () => {
    const buckets: BucketMap = new Map([
      [2, new Set([card2])]
    ]);
    
    const result = update(buckets, card1, AnswerDifficulty.Easy);
    assert.deepStrictEqual(result, buckets);
  });
});


/*
 * Testing strategy for getHint():
 * 
 * Partitions:
 * - Retrieve hint from flashcard with different hint texts
 * 
 * Coverage:
 * - Verify correct hint is returned
 * - Handle different hint lengths and contents
 */

describe("getHint()", () => {
  it("should return the hint from the flashcard", () => {
    const card = new Flashcard("Q1", "A1", "Test Hint", []);
    const result = getHint(card);
    assert.strictEqual(result, "Test Hint");
  });
});


/*
 * Testing strategy for computeProgress():
 * 
 * Partitions:
 * - Empty buckets
 * - No history
 * - Partial progress
 * - Full progress
 * - Different difficulty levels in history
 * 
 * Coverage:
 * - Calculate progress percentage correctly
 * - Handle edge cases like zero total flashcards
 * - Verify progress calculation with different input scenarios
 */

describe("computeProgress()", () => {
  const card1 = new Flashcard("Q1", "A1", "Hint1", []);
  const card2 = new Flashcard("Q2", "A2", "Hint2", []);
  const card3 = new Flashcard("Q3", "A3", "Hint3", []);

  it("should return 0% progress for empty buckets", () => {
    const buckets: BucketMap = new Map();
    const history: Array<{ card: Flashcard; difficulty: AnswerDifficulty }> = [];
    
    const result = computeProgress(buckets, history);
    assert.strictEqual(result.progressPercentage, 0);
  });

  it("should calculate partial progress", () => {
    const buckets: BucketMap = new Map([
      [0, new Set([card1, card2, card3])]
    ]);
    
    const history: Array<{ card: Flashcard; difficulty: AnswerDifficulty }> = [
      { card: card1, difficulty: AnswerDifficulty.Easy },
      { card: card2, difficulty: AnswerDifficulty.Hard }
    ];
    
    const result = computeProgress(buckets, history);
    assert.strictEqual(result.progressPercentage, (2 / 3) * 100);
  });

  it("should calculate full progress", () => {
    const buckets: BucketMap = new Map([
      [0, new Set([card1, card2])]
    ]);
    
    const history: Array<{ card: Flashcard; difficulty: AnswerDifficulty }> = [
      { card: card1, difficulty: AnswerDifficulty.Easy },
      { card: card2, difficulty: AnswerDifficulty.Hard }
    ];
    
    const result = computeProgress(buckets, history);
    assert.strictEqual(result.progressPercentage, 100);
  });
});