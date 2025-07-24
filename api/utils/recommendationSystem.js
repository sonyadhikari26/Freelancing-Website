// Function to format the gig data (title, description, category)
export const formatGigsData = (gigs) => {
  return gigs.map((gig) => ({
    id: gig._id.toString(),
    content: `${gig.title} ${gig.desc} ${gig.cat}`.toLowerCase(),
  }));
};

// Function to calculate Term Frequency (TF)
const calculateTermFrequency = (term, document) => {
  const words = document.split(" ");
  const termCount = words.filter((word) => word === term).length;
  return termCount / words.length;
};

// Function to calculate Inverse Document Frequency (IDF)
const calculateInverseDocumentFrequency = (term, allDocuments) => {
  const docsWithTerm = allDocuments.filter((doc) =>
    doc.content.includes(term)
  ).length;
  return Math.log(allDocuments.length / (1 + docsWithTerm)); // Adding 1 to avoid division by zero
};

// Function to calculate TF-IDF for each term in a document
const calculateTfIdf = (document, allDocuments) => {
  const terms = new Set(document.split(" ")); // Unique terms in the document
  const tfidf = {};

  terms.forEach((term) => {
    const tf = calculateTermFrequency(term, document);
    const idf = calculateInverseDocumentFrequency(term, allDocuments);
    tfidf[term] = tf * idf;
  });

  return tfidf;
};

// Function to calculate the dot product of two vectors
const dotProduct = (vecA, vecB) => {
  let product = 0;
  for (const key in vecA) {
    if (vecB[key]) {
      product += vecA[key] * vecB[key];
    }
  }
  return product;
};

// Function to calculate the magnitude (length) of a vector
const magnitude = (vector) => {
  let sum = 0;
  for (const key in vector) {
    sum += vector[key] * vector[key];
  }
  return Math.sqrt(sum);
};

// Function to calculate cosine similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
  const dotProd = dotProduct(vecA, vecB);
  const magnitudeA = magnitude(vecA);
  const magnitudeB = magnitude(vecB);

  return dotProd / (magnitudeA * magnitudeB);
};

export const recommendSimilarGigs = (currentGigId, allGigs) => {
  const formattedGigs = formatGigsData(allGigs);

  // Get TF-IDF for all documents (gigs)
  const tfIdfVectors = formattedGigs.map((gig) => ({
    id: gig.id,
    vector: calculateTfIdf(gig.content, formattedGigs),
  }));

  // Get the vector for the current gig
  const currentGig = tfIdfVectors.find((gig) => gig.id === currentGigId);
  if (!currentGig) return [];

  // Calculate similarities between the current gig and other gigs
  const similarities = tfIdfVectors
    .filter((gig) => gig.id !== currentGigId) // Don't compare the gig with itself
    .map((gig) => ({
      id: gig.id,
      score: cosineSimilarity(currentGig.vector, gig.vector),
    }))
    .sort((a, b) => b.score - a.score); // Sort by similarity score in descending order

  // Get the highest similarity score
  const topScore = similarities.length > 0 ? similarities[0].score : 0;

  // Use a dynamic threshold, e.g., 50% of the top score
  const threshold = topScore * 0.5;

  // Filter gigs based on this dynamic threshold
  return similarities
    .filter((similarity) => similarity.score >= threshold)
    .slice(0, 5);
};
