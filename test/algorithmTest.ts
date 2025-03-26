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
 * 1. Test an empty BucketMap, expecting an empty array.
 * 2. Test a BucketMap with a single non-empty bucket, expecting an array with one Set.
 * 3. Test a BucketMap with both empty and non-empty buckets, expecting the corresponding Set in the array.
 * 4. Test duplicate flashcards in a bucket, expecting unique cards in the Set.
 * 5. Test a BucketMap with gaps in bucket numbers, expecting empty Sets for missing buckets.
 */
describe("toBucketSets()", () => {
  it("should return an empty array for an empty BucketMap", () => {
    const result = toBucketSets(new Map());
    assert.deepEqual(result, []);
  });

  it("should return an array with one set for a BucketMap with one non-empty bucket", () => {
    const flashcard1 = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
    const buckets = new Map([[0, new Set([flashcard1])]]);
    const result = toBucketSets(buckets);
    assert.deepEqual(result, [new Set([flashcard1])]);
  });

  it("should return an array with empty sets for empty buckets", () => {
    const flashcard1 = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
    const flashcard2 = new Flashcard("Front2", "Back2", "Hint2", ["tag2"]);
    const buckets = new Map([
      [0, new Set([flashcard1])],
      [1, new Set()],
      [2, new Set([flashcard2])],
    ]);
    const result = toBucketSets(buckets);
    assert.deepEqual(result, [new Set([flashcard1]), new Set(), new Set([flashcard2])]);
  });

  it("should ignore duplicate flashcards in a bucket", () => {
    const flashcard = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
    const buckets = new Map([[0, new Set([flashcard, flashcard])]]);
    const result = toBucketSets(buckets);
    assert.deepEqual(result, [new Set([flashcard])]);
  });

  it("should handle buckets with no cards and buckets with cards correctly", () => {
    const flashcard1 = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
    const buckets = new Map([
      [0, new Set([flashcard1])],
      [2, new Set()],
      [5, new Set([flashcard1])],
    ]);
    const result = toBucketSets(buckets);
    assert.deepEqual(result, [new Set([flashcard1]), new Set(), new Set(), new Set(), new Set([flashcard1])]);
  });
});

/*
 * Testing strategy for getBucketRange():
 *
 * 1. Test an empty array of sets, expecting undefined.
 * 2. Test a non-empty array with one set, expecting the range to be that single index.
 * 3. Test an array with multiple non-empty sets, expecting the correct min and max index.
 * 4. Test an array with some empty sets, ensuring the range accounts for the first and last non-empty set.
 */
describe("getBucketRange()", () => {
  it("should return undefined for an empty array of sets", () => {
    const result = getBucketRange([]);
    assert.strictEqual(result, undefined);
  });

  it("should return the same bucket index for a single non-empty set", () => {
    const result = getBucketRange([new Set([new Flashcard("front", "back", "hint", [])])]);
    assert.deepEqual(result, { minBucket: 0, maxBucket: 0 });
  });

  it("should return correct range for multiple non-empty sets", () => {
    const result = getBucketRange([new Set([new Flashcard("front", "back", "hint", [])]), new Set()]);
    assert.deepEqual(result, { minBucket: 0, maxBucket: 1 });
  });

  it("should return correct range for buckets with empty sets", () => {
    const result = getBucketRange([new Set(), new Set([new Flashcard("front", "back", "hint", [])]), new Set()]);
    assert.deepEqual(result, { minBucket: 1, maxBucket: 1 });
  });
});

/*
 * Testing strategy for practice():
 *
 * 1. Test with a bucket containing cards, expecting a random subset to be selected based on the day.
 * 2. Test with an empty bucket, expecting an empty set to be returned.
 * 3. Test different day values to see how the function selects cards.
 */
describe("practice()", () => {
  it("should return an empty set for an empty bucket", () => {
    const result = practice([], 1);
    assert.deepEqual(result, new Set());
  });

  it("should return a subset of flashcards based on the day", () => {
    const flashcard1 = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
    const result = practice([new Set([flashcard1])], 1);
    assert.deepEqual(result, new Set([flashcard1]));
  });
});

/*
 * Testing strategy for update():
 *
 * 1. Test when the difficulty is "Wrong", expecting the flashcard to move to the lowest bucket.
 * 2. Test when the difficulty is "Hard", expecting the flashcard to move to a higher bucket but not the highest.
 * 3. Test when the difficulty is "Easy", expecting the flashcard to move to the highest bucket.
 * 4. Test that the function handles updating the buckets correctly without overwriting flashcards.
 */
describe("update()", () => {
  it("should move the flashcard to the lowest bucket on 'Wrong' difficulty", () => {
    const flashcard = new Flashcard("front", "back", "hint", []);
    const buckets = new Map([[0, new Set([flashcard])]]);
    const result = update(buckets, flashcard, AnswerDifficulty.Wrong);
    assert.strictEqual(result.get(0)?.size, 0);  // Flashcard should move from bucket 0
    assert.strictEqual(result.get(1)?.size, 1);  // Should move to bucket 1
  });

  it("should move the flashcard to a higher bucket on 'Hard' difficulty", () => {
    const flashcard = new Flashcard("front", "back", "hint", []);
    const buckets = new Map([[0, new Set([flashcard])]]);
    const result = update(buckets, flashcard, AnswerDifficulty.Hard);
    assert.strictEqual(result.get(0)?.size, 0);  // Flashcard should move from bucket 0
    assert.strictEqual(result.get(1)?.size, 1);  // Should move to bucket 1
  });

  it("should move the flashcard to the highest bucket on 'Easy' difficulty", () => {
    const flashcard = new Flashcard("front", "back", "hint", []);
    const buckets = new Map([[0, new Set([flashcard])]]);
    const result = update(buckets, flashcard, AnswerDifficulty.Easy);
    assert.strictEqual(result.get(0)?.size, 0);  // Flashcard should move from bucket 0
    assert.strictEqual(result.get(2)?.size, 1);  // Should move to bucket 2
  });
});

/*
 * Testing strategy for getHint():
 *
 * 1. Test if the hint matches the weak hint from the flashcard.
 * 2. Test edge cases where hints are empty or null.
 */
describe("getHint()", () => {
  it("should return the hint from the flashcard", () => {
    const flashcard = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
    const result = getHint(flashcard);
    assert.strictEqual(result, "Hint1");
  });

  it("should return an empty string if no hint is provided", () => {
    const flashcard = new Flashcard("Front1", "Back1", "", ["tag1"]);
    const result = getHint(flashcard);
    assert.strictEqual(result, "");
  });
});

/*
 * Testing strategy for computeProgress():
 *
 * 1. Test that the function computes progress correctly based on the current buckets.
 * 2. Test edge cases where all flashcards are in the same bucket.
 * 3. Test edge cases with no progress (e.g., flashcards in the lowest bucket).
 */
describe("computeProgress()", () => {
  it("should compute progress correctly based on current buckets", () => {
    const flashcard1 = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
    const buckets = new Map([[0, new Set([flashcard1])]]);
    const history = [{ card: flashcard1, difficulty: AnswerDifficulty.Easy }];
    const result = computeProgress(buckets, history);
    assert.deepEqual(result, { minBucket: 0, maxBucket: 0 });
  });

  it("should handle edge cases where all flashcards are in the same bucket", () => {
    const flashcard1 = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
    const buckets = new Map([[0, new Set([flashcard1])]]);
    const history = [{ card: flashcard1, difficulty: AnswerDifficulty.Wrong }];
    const result = computeProgress(buckets, history);
    assert.deepEqual(result, { minBucket: 0, maxBucket: 0 });
  });

  it("should compute no progress if flashcards are in the lowest bucket", () => {
    const flashcard1 = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
    const buckets = new Map([[0, new Set([flashcard1])]]);
    const history = [{ card: flashcard1, difficulty: AnswerDifficulty.Wrong }];
    const result = computeProgress(buckets, history);
    assert.deepEqual(result, { minBucket: 0, maxBucket: 0 });
  });
});
