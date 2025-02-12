<template>
  <div class="comment-thread">
    <div 
      :class="['comment', { 'nested-comment': depth > 0 }]" 
      :style="{ marginLeft: `${depth * 20}px` }"
    >
      <div class="comment-header">
        <span class="username">{{ comment.username }}</span>
        <small class="timestamp">
          {{ formatRelativeTime(comment.createdAt) }}
        </small>
      </div>
      
      <div class="comment-content">
        <p>{{ comment.content }}</p>
        
        <div class="comment-actions">
          <button @click="handleVote(comment.id,'UPVOTE')">
            ↑ {{ comment.upvotes }}
          </button>
          <button @click="handleVote(comment.id,'DOWNVOTE')">
            ↓ {{ comment.downvotes }}
          </button>
          <button @click="showReplyForm = !showReplyForm">
            Reply
          </button>
        </div>
      </div>

      <!-- Reply Form -->
      <div v-if="showReplyForm" class="reply-form">
        <textarea 
          v-model="replyContent" 
          placeholder="Write a reply..."
        ></textarea>
        <div class="reply-actions">
          <button @click="submitReply">Submit</button>
          <button @click="showReplyForm = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Nested Replies -->
    <div v-if="comment.children && comment.children.length" class="nested-replies">
      <!-- Show first two children by default -->
      <Comment
        v-for="(childComment, index) in displayedChildren"
        :key="childComment.id"
        :comment="childComment"
        :depth="depth + 1"
        :review-id="reviewId"
        @vote="$emit('vote', $event)"
        @reply="$emit('reply', $event)"
      />

      <!-- Expand button -->
      <div 
        v-if="comment.children.length > displayLimit && !isExpanded" 
        class="expand-thread"
      >
        <button @click="isExpanded = true">
          Show {{ comment.children.length - displayLimit }} more 
          {{ comment.children.length - displayLimit === 1 ? 'reply' : 'replies' }}
        </button>
      </div>

      <!-- Expanded children -->
      <Comment
        v-if="isExpanded"
        v-for="(childComment, index) in (comment.children.slice(displayLimit))"
        :key="childComment.id"
        :comment="childComment"
        :depth="depth + 1"
        :review-id="reviewId"
        @vote="$emit('vote', $event)"
        @reply="$emit('reply', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  reviewId: {
    type: String,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['vote', 'reply']);

const showReplyForm = ref(false);
const replyContent = ref('');
const isExpanded = ref(false);
const displayLimit = 1;
const {$store} = useNuxtApp()

const displayedChildren = computed(() => 
  props.comment.children?.slice(0, displayLimit)
);

const formatRelativeTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffSeconds = (now - date) / 1000;
  
  if (diffSeconds < 60) return 'just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
};

const toggleVote = (type) => {
  emit('vote', { 
    commentId: props.comment.id, 
    type 
  });
};

const hasVoted = ref(props.comment.hasVoted)
const hasVotedType = ref(props.comment.hasVoted? props.comment.voteType : "")
const validateVoteType = (type) =>{
  return type==="UPVOTE" || type === "DOWNVOTE"
}

const handleVote = async (commentId, type) => {
  if (!validateVoteType(type)) return; // Guard against invalid vote types.

  const previousType = hasVotedType.value;
  const isSameVote = hasVoted.value && previousType === type;
  const isDifferentVote = hasVoted.value && previousType !== type;

  try {
    if (isSameVote) {
      // Remove the same vote type.
      await removeVote(commentId);
      if (type === "UPVOTE") props.comment.upvotes--;
      else props.comment.downvotes--;
      hasVoted.value = false;
      props.hasVoted = false;
      hasVotedType.value = "";
      props.voteType = "";
    } else if (isDifferentVote) {
      // Switch vote type.
      await $fetch(`${API}reviews/comment/${commentId}/vote`, {
        method: "POST",
        headers: await $store.getNormalHeaders(),
        body:{type}
      });
      if (previousType === "UPVOTE") props.comment.upvotes--;
      else props.comment.downvotes--;
      if (type === "UPVOTE") props.comment.upvotes++;
      else props.comment.downvotes++;
      hasVotedType.value = type;
      props.voteType = type
    } else {
      // New vote.
      await $fetch(`${API}reviews/comment/${commentId}/vote`, {
        method: "POST",
        headers: await $store.getNormalHeaders(),
        body:{type}
      });
      if (type === "UPVOTE") props.comment.upvotes++;
      else props.comment.downvotes++;
      hasVoted.value = true;
      props.hasVoted = true;
      hasVotedType.value = type;
      props.voteType = type;
    }
  } catch (error) {
    console.error("Error handling vote:", error);
    // Optionally show a toast/notification for API error.
  }
};
const removeVote = async (commentId) => {
  try{
    const response = await $fetch(`${API}reviews/comment/${commentId}/vote`, {
        method: "DELETE",
        headers: await $store.getNormalHeaders(),
      });
  }catch(e){
    console.log(e)
  }
}

const submitReply = () => {
  if (!replyContent.value.trim()) return;

  emit('reply', { 
    parentId: props.comment.id, 
    content: replyContent.value 
  });

  replyContent.value = '';
  showReplyForm.value = false;
};
</script>

<style scoped>
.comment-thread {
  margin-bottom: 10px;
}

.comment {
  background: #f9f9f9;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 5px;
}

.nested-comment {
  background: #f0f0f0;
  border-left: 2px solid #e0e0e0;
  padding-left: 15px;
}

.nested-comment .comment-header {
  font-size: 0.9em;
}

.nested-comment .comment-content {
  font-size: 0.95em;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.username {
  font-weight: bold;
  color: #333;
}

.timestamp {
  color: #888;
  font-size: 0.8em;
}

.comment-content {
  margin-bottom: 10px;
}

.comment-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.comment-actions button {
  background: none;
  border: 1px solid #ddd;
  color: #666;
  padding: 5px 10px;
}

.reply-form {
  margin-top: 10px;
}

.reply-form textarea {
  width: 100%;
  min-height: 80px;
  margin-bottom: 10px;
}

.reply-actions {
  display: flex;
  gap: 10px;
}

.expand-thread {
  margin-top: 10px;
  text-align: left;
}

.expand-thread button {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  padding: 5px 0;
}

.expand-thread button:hover {
  text-decoration: underline;
}
</style>