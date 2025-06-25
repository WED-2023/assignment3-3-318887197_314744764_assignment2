Get request to get a specific recipe when image is clicked on wouldnt work because we dsigned the backend to
extract from the request body but axios cannot pass the body in get requests.
backend and api updated accordingly
changed the backend to update Likes, LastWatched and Favorites to update the table on duplicate entries to update the date to NOW