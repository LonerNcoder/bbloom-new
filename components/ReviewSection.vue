<template>
    <div class="review-section">
      <!-- Add Review Button -->
      <button 
        v-if="!hasReviewed" 
        @click="showAddForm = true" 
        class="add-review-btn"
      >
        Add Review
      </button>
  
      <!-- Add Review Form -->
      <div v-if="showAddForm" class="add-review">
        <div class="rating">
          <span 
            v-for="star in 5" 
            :key="star" 
            @click="setRating(star)"
            :class="{ 'selected': newReview.rating >= star }"
          >
            ★
          </span>
        </div>
        <textarea 
          v-model="newReview.content" 
          placeholder="Write your review..."
        ></textarea>
        <button @click="submitReview">Submit Review</button>
        <button @click="showAddForm = false">Cancel</button>
      </div>
  
      <!-- Empty State -->
      <div v-if="!reviewInstance || reviewInstance.reviews.length === 0" class="empty-state">
        No reviews yet. Be the first to review!
      </div>
  
      <!-- Reviews List -->
      <div v-if="reviewInstance" v-for="review in reviewInstance.reviews" :key="review.id" class="review">
        <div class="review-header">
          <div class="review-meta">
            <span class="rating">
              {{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}
            </span>
            <small>{{ new Date(review.createdAt).toLocaleString() }}</small>
          </div>
        </div>
  
        <!-- Root Comment -->
        <Comment
          :comment="review.rootComment"
          :review-id="review.id"
          @vote="handleVote"
          @reply="handleReply"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
//   import CommentThread from './CommentThread.vue';
  
  const { $store } = useNuxtApp();
  const props = defineProps({ instanceId: { type: String, required: true } });
  
  // Reactive state
  const reviewInstance = ref(null);
  const showAddForm = ref(false);
  const newReview = ref({ rating: 0, content: '' });
  const currentUserId = await $store.getUserId();
  const hasReviewed = computed(() => 
    reviewInstance.value?.reviews.some(r => r.rootComment.userId === currentUserId)
  );
  
  // Fetch reviews
  watch(() => props.instanceId, async (instanceId) => {
    if (!instanceId) return;
    
    try {
      const response = await $fetch(`${API}reviews/${instanceId}`, {
        headers: await $store.getNormalHeaders()
      });
      reviewInstance.value = response.reviewInstance;
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, { immediate: true });
  
  // Review actions
  const setRating = (stars) => newReview.value.rating = stars;
  
  const submitReview = async () => {
    try {
      const response = await $fetch(`${API}review-instances/${props.instanceId}/reviews`, {
        method: "POST",
        headers: await $store.getNormalHeaders(),
        body: {
          rating: newReview.value.rating,
          rootComment: { content: newReview.value.content }
        }
      });
      
      if (reviewInstance.value) {
        reviewInstance.value.reviews.unshift(response);
      }
      showAddForm.value = false;
      newReview.value = { rating: 0, content: '' };
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };
  
//   // Comment actions
//   const handleVote = async ({ commentId, type }) => {
//     try {
//       const response = await $fetch(`${API}reviews/comment/${commentId}/vote`, {
//         method: "POST",
//         headers: await $store.getNormalHeaders(),
//         body: { type }
//       });
  
//       const updateCommentVotes = (comment) => {
//         if (comment.id === commentId) {
//             if(type === "UPVOTE"){
//                 comment.votes.upvotes++;
//             }
//             if(type === "DOWNVOTE"){
//                 if(type === "UPVOTE"){
//                 comment.votes.downvotes++;
//             }
//             }
//         }
//         comment.children?.forEach(updateCommentVotes);
//         return comment;
//       };
  
//       if (reviewInstance.value) {
//         reviewInstance.value.reviews = reviewInstance.value.reviews.map(review => {
//           review.rootComment = updateCommentVotes(review.rootComment);
//           return review;
//         });
//       }
//     } catch (error) {
//       console.error('Error voting:', error);
//     }
//   };
  
  const handleReply = async ({ parentId, content }) => {
    try {
      const response = await $fetch(`${API}reviews/comment/${parentId}/reply`, {
        method: "POST",
        headers: await $store.getNormalHeaders(),
        body: { content }
      });
  
      const addNestedReply = (comment) => {
        if (comment.id === parentId) {
          comment.children.push(response);
        } else {
          comment.children?.forEach(addNestedReply);
        }
        return comment;
      };
  
      if (reviewInstance.value) {
        reviewInstance.value.reviews = reviewInstance.value.reviews.map(review => {
          review.rootComment = addNestedReply(review.rootComment);
          return review;
        });
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };
  </script>
  <style scoped>
  .review-section {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .review {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .review-meta {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .username {
    font-weight: 600;
    color: #2c3e50;
  }
  
  .rating {
    color: #f39c12;
  }
  
  .rating span {
    font-size: 1.2em;
    margin-right: 3px;
  }
  
  .review-voting {
    display: flex;
    gap: 8px;
  }
  
  .review-voting button {
    padding: 6px 12px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #495057;
  }
  
  .review-voting button:hover {
    background: #e9ecef;
  }
  
  .content {
    color: #495057;
    line-height: 1.6;
    margin-bottom: 15px;
  }
  
  .comments {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #eee;
  }
  
  .comment-form {
    margin-bottom: 20px;
  }
  
  .comment-form textarea {
    width: 100%;
    height: 80px;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }
  
  .add-review-btn {
    display: block;
    width: 100%;
    margin-bottom: 20px;
    padding: 12px;
    font-size: 1em;
  }
  
  .add-review {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .add-review textarea {
    width: 100%;
    height: 100px;
    margin: 10px 0;
    padding: 10px;
  }
  
  button {
    background: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  button:hover {
    background: #2980b9;
  }
  
  .empty-state {
    text-align: center;
    padding: 40px;
    background: #f8f9fa;
    border-radius: 8px;
  }
  </style>