<template>
  <div class="recipe-preview card h-100" :class="{ 'blurred': isBlurred }">
    <router-link
      v-if="isClickable"
      :to="{ name: 'recipe', params: { recipeId: recipe.id } }"
      class="text-decoration-none text-dark"
    >
      <img
        v-if="recipe.image"
        :src="recipe.image"
        class="card-img-top recipe-image"
        :alt="recipe.title"
      />
      <div class="card-body">
        <h5 class="card-title">{{ recipe.title }}</h5>
        <div class="recipe-meta">
          <small class="text-muted">
            <i class="fas fa-clock me-1"></i>{{ recipe.readyInMinutes }} min
          </small>
          <small class="text-muted ms-3">
            <i class="fas fa-heart me-1"></i>{{ recipe.aggregateLikes }} likes
          </small>
        </div>
      </div>
    </router-link>
    
    <!-- Non-clickable version for blurred recipes -->
    <div v-else>
      <img
        v-if="recipe.image"
        :src="recipe.image"
        class="card-img-top recipe-image"
        :alt="recipe.title"
      />
      <div class="card-body">
        <h5 class="card-title">{{ recipe.title }}</h5>
        <div class="recipe-meta">
          <small class="text-muted">
            <i class="fas fa-clock me-1"></i>{{ recipe.readyInMinutes }} min
          </small>
          <small class="text-muted ms-3">
            <i class="fas fa-heart me-1"></i>{{ recipe.aggregateLikes }} likes
          </small>
        </div>
      </div>
    </div>

    <!-- Action buttons (only show when not blurred and user is logged in) -->
    <div v-if="!isBlurred && store.username" class="card-footer bg-transparent border-0">
      <div class="d-flex justify-content-between align-items-center">
        <!-- Like button with heart icon only -->
        <button
          @click.stop="handleToggleLike"
          :class="['btn btn-sm action-btn like-btn', { 'liked': isLiked }]"
          :disabled="likedLoading"
          :title="isLiked ? 'Remove like' : 'Like this recipe'"
        >
          <i v-if="isLiked" class="fas fa-heart"></i>
          <i v-else class="far fa-heart"></i>
        </button>

        <!-- Favorite button with star icon only -->
        <button
          @click.stop="handleToggleFavorite"
          :class="['btn btn-sm action-btn favorite-btn', { 'favorited': isFavorite }]"
          :disabled="favoritesLoading"
          :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
        >
          <i v-if="isFavorite" class="fas fa-star"></i>
          <i v-else class="far fa-star"></i>
        </button>
      </div>
    </div>

    <!-- Watched indicator -->
    <div v-if="isWatched" class="watched-indicator">
      <i class="fas fa-eye"></i>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import store from '@/store';
import { FavoritesAPI } from '@/composables/FavoritesAPI';
import { LikesAPI } from '@/composables/LikesAPI';

const props = defineProps({
  recipe: {
    type: Object,
    required: true
  },
  isBlurred: {
    type: Boolean,
    default: false
  },
  isClickable: {
    type: Boolean,
    default: true
  },
  watchedRecipeIds: {
    type: Array,
    default: () => []
  },
  favoriteRecipeIds: {
    type: Array,
    default: () => []
  },
  likedRecipeIds: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['favoriteToggled', 'likeToggled']);

const router = useRouter();

// Use composables (only for API calls, not for data fetching)
const { toggleFavorite, isLoading: favoritesLoading } = FavoritesAPI();
const { toggleLiked, isLoading: likedLoading } = LikesAPI();

// Computed properties using props
const isWatched = computed(() => props.watchedRecipeIds.includes(String(props.recipe.id)));
const isFavorite = computed(() => props.favoriteRecipeIds.includes(String(props.recipe.id)));
const isLiked = computed(() => props.likedRecipeIds.includes(String(props.recipe.id)));

// Methods
const handleToggleFavorite = async () => {
  if (!store.username) {
    router.push({ name: 'login' });
    return;
  }

  try {
    const success = await toggleFavorite(props.recipe.id, isFavorite.value);
    if (success) {
      // Emit event to parent to update the data
      emit('favoriteToggled', {
        recipeId: props.recipe.id,
        newState: !isFavorite.value
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
};

const handleToggleLike = async () => {
  if (!store.username) {
    router.push({ name: 'login' });
    return;
  }

  try {
    const success = await toggleLiked(props.recipe.id, isLiked.value);
    if (success) {
      // Emit event to parent to update the data
      emit('likeToggled', {
        recipeId: props.recipe.id,
        newState: !isLiked.value
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
  }
};
</script>

<style scoped>
.recipe-preview {
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.recipe-preview:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.recipe-image {
  height: 200px;
  object-fit: cover;
  border-radius: 0.375rem 0.375rem 0 0;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.recipe-meta {
  display: flex;
  align-items: center;
}

.action-btn {
  border: 2px solid #dee2e6;
  background: white;
  color: #6c757d;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.like-btn:hover {
  border-color: #dc3545;
  background: #fdf2f2;
  transform: scale(1.1);
}

.like-btn:hover i {
  color: #dc3545;
}

.like-btn.liked {
  background: #dc3545;
  border-color: #dc3545;
}

.like-btn.liked i {
  color: white;
}

.favorite-btn:hover {
  border-color: #ffc107;
  background: #fffdf5;
  transform: scale(1.1);
}

.favorite-btn:hover i {
  color: #ffc107;
}

.favorite-btn.favorited {
  background: #ffc107;
  border-color: #ffc107;
}

.favorite-btn.favorited i {
  color: #212529;
}

/* Icon styling */
.action-btn i {
  transition: all 0.3s ease;
  font-size: 1rem;
}

.like-btn i {
  color: #6c757d;
}

.favorite-btn i {
  color: #6c757d;
}

.watched-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.blurred {
  filter: blur(4px);
  pointer-events: none;
}

.card-footer {
  padding: 0.75rem;
}


</style>