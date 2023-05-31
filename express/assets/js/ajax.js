$(document).ready(function(){

    //make sure the page stays in the same position once you click the like button
    //doesn't refresh the page
    $(document).on('submit', '#like_form', function(event){
        event.preventDefault(); //default is reloading the page
        var heartIcon = $(this).find('.likeButton').find('svg');
        var likeButton = $(this).find('.likeButton');
        var form = $(this);
        
        $.ajax({
            url:'/like',
            data: $(this).serialize(),
            type:'post',
            dataType:'json',
            success: function(data){ //what happens if event happened successfully
                var numberLikesDiv = form.parent().prev().prev(); //find the div outside the form
                // numberLikesDiv.html(response.numberLikesHtml);
                console.log(numberLikesDiv);
                console.log(data.message);
                var nrLikes = numberLikesDiv.find('#nrLikes');
                console.log(nrLikes.text());


                
                if(heartIcon.hasClass('bi-heart')){
                                 
                    //change nr of likes
                    nrLikes.text(parseInt(nrLikes.text()) +1); //increases nr likes text by one on screen instead of refreshing page

                    likeButton.removeClass('btn-primary');
                    likeButton.addClass('btn-outline-primary');
        
                    likeButton.html(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                  </svg> &nbsp; Liked`);

                }else{ //if they already liked it and want to unlike it
                    nrLikes.text(parseInt(nrLikes.text()) -1);

                    likeButton.removeClass('btn-outline-primary');
                    likeButton.addClass('btn-primary');

                    likeButton.html(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                  </svg> &nbsp; Like`);
                }
            },
            err: function(error){
                console.log("error with the ajax thing ups", error);
            }
        });    
    });

    //make sure the page stays in the same position once you post a comment
    $(document).on('submit', '#comment_section', function(event){
        event.preventDefault(); //default is reloading page
        var commentForm = $(this);
        var numberCommentsDiv = commentForm.parent().parent().prev().prev().prev();

        $.ajax({
            url: '/comment',
            data: $(this).serialize(),
            type: 'post',
            dataType:'json',
            success: function(data){

                //format time of comment in nicer way, aka no seconds and timezone %>
                var date = new Date();
                var formattedDate = ("0" + date.getDate()).slice(-2) + "/"
                                      + ("0" + (date.getMonth() + 1)).slice(-2) + "/"
                                      + date.getFullYear().toString() + " "
                                      + ("0" + date.getHours()).slice(-2) + ":"
                                      + ("0" + date.getMinutes()).slice(-2);

                //create a div with the comment
                // create a new div element
                
                // create the <p> elements
                var $p1 = $("<p>").text(`@${data.username}:  ${data.comment}`);
                var $p2 = $("<p>").text(`${formattedDate}`);

                // append the <p> elements to the new div
                commentForm.parent().next('#whiteCardCommentSection').append($p1);
                commentForm.parent().next('#whiteCardCommentSection').append($p2);
                console.log(commentForm.next('#whiteCardCommentSection'));

                commentForm.parent().next('#whiteCardCommentSection').find('.no_comments').remove();

                
                commentForm.find('#comment').val(''); //clears the comment input section

                var nrComments = numberCommentsDiv.find('#nrComments');
                nrComments.text(parseInt(nrComments.text()) +1);
            }

        })
    })


});