let recommendationContext = null;

const setRecommendationContext = (context) => {
  recommendationContext = context;
};

const getRecommendationContext = () => {
  if (!recommendationContext) {
    throw new Error("Recommendation context has not been initialized");
  }

  return recommendationContext;
};

module.exports = {
  getRecommendationContext,
  setRecommendationContext,
};
