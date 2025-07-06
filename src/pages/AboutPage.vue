<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="text-center mb-5">
          <h1 class="display-4 mb-4">About Us</h1>
          <div class="about-content">
            <p class="lead mb-4">
              We are <strong>Lea</strong> and <strong>Denis</strong> and this is our recipe site! 👨‍🍳👩‍🍳
            </p>
            <p class="mb-4">
              We worked very hard to make it work, and as intuitive as possible. 
              Our goal was to create a platform where you can store, share, and discover amazing recipes, 
              whether they're your personal favorites or cherished family traditions.
            </p>
          </div>
        </div>

        <!-- Project Links Section -->
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="fas fa-code me-2"></i>
              Our Project Links
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4 mb-3">
                <div class="text-center">
                  <i class="fas fa-desktop fa-2x text-primary mb-2"></i>
                  <h6>Frontend</h6>
                  <a 
                    href="https://github.com/WED-2023/assignment3-3-318887197_314744764_assignment2" 
                    class="btn btn-outline-primary btn-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i class="fab fa-github me-1"></i>
                    View Repository
                  </a>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="text-center">
                  <i class="fas fa-server fa-2x text-success mb-2"></i>
                  <h6>Backend</h6>
                  <a 
                    href="https://github.com/WED-2023/assignment3-2-318887197_314744764_assignment2" 
                    class="btn btn-outline-success btn-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i class="fab fa-github me-1"></i>
                    View Repository
                  </a>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="text-center">
                  <i class="fas fa-rocket fa-2x text-warning mb-2"></i>
                  <h6>Spaceship Game</h6>
                  <a 
                    href="https://github.com/WED-2023/assignment2-318887197_314744764_assignment2" 
                    class="btn btn-outline-warning btn-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i class="fab fa-github me-1"></i>
                    View Repository
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Projects Section -->
        <div class="card shadow-sm mt-4">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">
              <i class="fas fa-user me-2"></i>
              Our Personal Projects
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <div class="text-center">
                  <i class="fas fa-user-tie fa-2x text-dark mb-2"></i>
                  <h6>Denis - Morgan Freeman Page</h6>
                  <p class="text-muted small">A tribute page dedicated to the legendary actor</p>
                  <a 
                    href="https://github.com/WED-2023/318887197" 
                    class="btn btn-outline-dark btn-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i class="fab fa-github me-1"></i>
                    View Repository
                  </a>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <div class="text-center">
                  <i class="fas fa-snowflake fa-2x text-info mb-2"></i>
                  <h6>Lea - Ice King Page</h6>
                  <p class="text-muted small">A creative page featuring the Ice King character</p>
                  <a 
                    href="https://github.com/WED-2023/314744764" 
                    class="btn btn-outline-info btn-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i class="fab fa-github me-1"></i>
                    View Repository
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="text-center mt-5">
          <p class="text-muted">
            <i class="fas fa-heart text-danger me-1"></i>
            Made with love and lots of coffee
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No script needed for this static page
</script>

<style scoped>
.about-content {
  font-size: 1.1rem;
  line-height: 1.6;
}

.card {
  border: none;
  border-radius: 0.5rem;
}

.card-header {
  border-radius: 0.5rem 0.5rem 0 0;
}

.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.fa-2x {
  margin-bottom: 0.5rem;
}

/* Additional styling for personal projects section */
.card + .card {
  margin-top: 1rem;
}

.text-muted.small {
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

/* Icon colors for personal projects */
.fa-user-tie {
  color: #2c3e50;
}

.fa-snowflake {
  color: #17a2b8;
}
</style>