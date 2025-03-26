/**
 * Problem Set 1: Flashcards - Algorithm Functions
 *
 * This file contains the implementations for the flashcard algorithm functions
 * as described in the problem set handout.
 *
 * Please DO NOT modify the signatures of the exported functions in this file,
 * or you risk failing the autograder.
 */

import { Flashcard, AnswerDifficulty, BucketMap } from "./flashcards";

/**
 * Converts a Map representation of learning buckets into an Array-of-Set representation.
 *
 * @param buckets Map where keys are bucket numbers and values are sets of Flashcards.
 * @returns Array of Sets, where element at index i is the set of flashcards in bucket i.
 *          Buckets with no cards will have empty sets in the array.
 * @spec.requires buckets is a valid representation of flashcard buckets.
 */
export function toBucketSets(buckets: BucketMap): Array<Set<Flashcard>> {
  // Determine the highest bucket number
  const maxBucketNumber = Math.max(...Array.from(buckets.keys()), 0);
  
  // Create an array of sets, one for each bucket
  const result: Array<Set<Flashcard>> = new Array(maxBucketNumber + 1).fill(null).map(() => new Set<Flashcard>());
  
  // Populate the result array with the flashcards from each bucket
  buckets.forEach((flashcards, bucketNumber) => {
    result[bucketNumber] = flashcards;
  });

  return result;
}


/**
 * Finds the range of buckets that contain flashcards, as a rough measure of progress.
 *
 * @param buckets Array-of-Set representation of buckets.
 * @returns object with minBucket and maxBucket properties representing the range,
 *          or undefined if no buckets contain cards.
 * @spec.requires buckets is a valid Array-of-Set representation of flashcard buckets.
 */
export function getBucketRange(
  buckets: Array<Set<Flashcard>>
): { minBucket: number; maxBucket: number } | undefined {
  let minBucket = -1;
  let maxBucket = -1;

  // Loop through the array to find the minimum and maximum non-empty buckets
  for (let i = 0; i < buckets.length; i++) {
    const bucket = buckets[i];

    // Check if bucket is a valid Set and is non-empty
    if (bucket instanceof Set && bucket.size > 0) {
      if (minBucket === -1) {
        minBucket = i; // First non-empty bucket found
      }
      maxBucket = i; // Update maxBucket on every non-empty bucket
    }
  }

  // If no non-empty buckets were found, return undefined
  if (minBucket === -1) {
    return undefined;
  }

  return { minBucket, maxBucket };
}


/**
 * Selects cards to practice on a particular day.
 *
 * @param buckets Array-of-Set representation of buckets.
 * @param day current day number (starting from 0).
 * @returns a Set of Flashcards that should be practiced on day `day`,
 *          according to the Modified-Leitner algorithm.
 * @spec.requires buckets is a valid Array-of-Set representation of flashcard buckets.
 */
export function practice(
  buckets: Array<Set<Flashcard>>,
  day: number
): Set<Flashcard> {
  const practiceSet = new Set<Flashcard>();

  // Iterate over the array up to the given day
  for (let i = 0; i < day; i++) {
    const bucket = buckets[i];

    // Check if bucket is defined and is an instance of Set
    if (bucket instanceof Set) {
      // Add all flashcards from the current bucket to the practice set
      bucket.forEach(flashcard => practiceSet.add(flashcard));
    }
  }

  return practiceSet;
}


/**
 * Updates a card's bucket number after a practice trial.
 *
 * @param buckets Map representation of learning buckets.
 * @param card flashcard that was practiced.
 * @param difficulty how well the user did on the card in this practice trial.
 * @returns updated Map of learning buckets.
 * @spec.requires buckets is a valid representation of flashcard buckets.
 */
export function update(
  buckets: BucketMap,
  card: Flashcard,
  difficulty: AnswerDifficulty
): BucketMap {
  // Create a copy of the buckets to avoid modifying the original
  const updatedBuckets = new Map(buckets);

  // Find the current bucket of the card
  let currentBucket: number | undefined;
  updatedBuckets.forEach((bucket, bucketIndex) => {
    if (bucket.has(card)) {
      currentBucket = bucketIndex;
    }
  });

  // If the card is not found in any bucket, return the original buckets
  if (currentBucket === undefined) {
    console.error('Flashcard not found in any bucket');
    return buckets;
  }

  // Calculate the new bucket based on the difficulty
  let newBucket: number;
  switch (difficulty) {
    case AnswerDifficulty.Wrong:
      newBucket = Math.max(0, currentBucket - 1); // Move to the previous bucket (harder interval)
      break;
    case AnswerDifficulty.Hard:
      newBucket = currentBucket; // Stay in the same bucket
      break;
    case AnswerDifficulty.Easy:
      newBucket = currentBucket + 1; // Move to the next bucket (easier interval)
      break;
    default:
      newBucket = currentBucket; // Default behavior
      break;
  }

  // Remove the card from the current bucket
  updatedBuckets.get(currentBucket)?.delete(card);

  // Add the card to the new bucket
  if (!updatedBuckets.has(newBucket)) {
    updatedBuckets.set(newBucket, new Set());
  }
  updatedBuckets.get(newBucket)?.add(card);

  return updatedBuckets;
}


/**
 * Generates a hint for a flashcard.
 *
 * @param card flashcard to hint
 * @returns a hint for the front of the flashcard.
 * @spec.requires card is a valid Flashcard.
 */
export function getHint(card: Flashcard): string {
  // Return the hint directly from the card
  return card.hint;
}


/**
 * Computes statistics about the user's learning progress.
 *
 * @param buckets representation of learning buckets.
 * @param history representation of user's answer history.
 * @returns statistics about learning progress.
 * @spec.requires [SPEC TO BE DEFINED]
 */
export function computeProgress(
  buckets: BucketMap,
  history: Array<{ card: Flashcard; difficulty: AnswerDifficulty }>
): { progressPercentage: number } {
  // Count the total number of flashcards across all buckets
  let totalFlashcards = 0;
  let correctlyAnsweredFlashcards = 0;

  // Calculate the total number of flashcards in the buckets
  for (const bucket of buckets.values()) {
    totalFlashcards += bucket.size;
  }

  // Iterate through history to determine how many flashcards have been answered with "Easy" or "Hard"
  for (const entry of history) {
    if (entry.difficulty >= AnswerDifficulty.Hard) {
      correctlyAnsweredFlashcards += 1;
    }
  }

  // If there are no flashcards, return 0% progress
  if (totalFlashcards === 0) {
    return { progressPercentage: 0 };
  }

  // Calculate progress percentage (correctly answered / total flashcards)
  const progressPercentage = (correctlyAnsweredFlashcards / totalFlashcards) * 100;

  return { progressPercentage };
}

