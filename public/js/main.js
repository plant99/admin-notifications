if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/js/worker.js')
    .then((registration) => {
      console.log('Service Worker registration completed with scope: ',
        registration.scope)
    }, (err) => {
      console.log('Service Worker registration failed', err)
    })
  })
} else {
  console.log('Service Workers not supported')
}


if(firstTime){

}
//the following if was inside the above if
if(window.NotificationToken){if(window.NotificationToken.getNotificationToken){
    token = window.NotificationToken.getNotificationToken();
    
    $.post('/subscribe_all', {
      token
    })
    .done(data => {
      console.log(data);
    })
    .fail(err => {
      console.log(err);
    })
  }}

let notifications = [],
  categories = [],
  muted_categories = [];
$.get('/get_notifications')
  .done(data => {
    notifications = data.notifications;
    console.log(notifications);
    $.get('/categories')
      .done(data => {
        categories = data.categories;
        //if logged in first, subscribe to every channels
        loadMuteUnmuteOptions(notifications);

        $.get('/floating_tokens')
          .done(data => {
            renderTokens(data.notifications || []);
          })
          .fail(err => {
            console.log(err);
          })
      })
      .fail(err => {
        console.log(err);
      })
  })
  .fail(err => {
    console.log(err);
  })
function renderTokens(notifications){
  let htmlToBeAppended = '';
  for(var i=0; i< notifications.length; i++){
    let notification = notifications[i];
    let html = `
      <div class="card">
          <div class="card-block">
              <h4 class="card-title">${notification.title}</h4>
              <p class="card-text">${notification.description}</p>
              <label for="category-edit">Category: </label>
              ${isAdmin?
                returnSelectOptionString(notification.category)
                :
                `<span class="category">${notification.category}</span>`
              }
              <br>
              <button data-id=${notification._id} class="btn btn-primary approve">APPROVE</button>
              <button data-id=${notification._id} class="btn btn-primary discard">DISCARD</button>
          </div>
      </div>
    `;
    htmlToBeAppended += html;
  }
  $('.tokens').html(htmlToBeAppended);
  $('.approve').click(e => {
    let notif_id = $(e.target).attr('data-id');
    console.log(e.target);
    $.post('/approve_token', {
      notif_id
    })
      .done(data => {
        console.log(data);
        location.reload();
      })
      .fail(err => {
        console.log(err);
        location.reload();
      });
  })
  $('.discard').click(e => {
    let notif_id = $(e.target).attr('data-id');
    console.log(e.target);
    $.post('/discard_token', {
      notif_id
    })
      .done(data => {
        console.log(data);
        location.reload();
      })
      .fail(err => {
        console.log(err);
        location.reload();
      });
  })
}
function loadMuteUnmuteOptions(notifications){

  $.get('/muted_categories')
    .done(data => {
      muted_categories = data.muted_topics;
      loadNotifications(notifications);
      loadMutedCategories(muted_categories);
      loadUnmutedCategories(muted_categories);
    })
    .fail(err => {
      console.log(err);
    })
}
function loadMutedCategories(categoriesTemp){
  let html = `<select class="unmute-select" id="unmute-select">`;
  for(var i=0; i<categoriesTemp.length; i++){
    html += `<option value="${categoriesTemp[i]}">${categoriesTemp[i]}</option>`
  }
  html += `</select>`
  $('.unmute-box').html(html);
  $("select").material_select();
  $('#save_unmute').click(() => {
    $.post(`/unmute`, {
      topic: document.getElementById('unmute-select').value
    })
    .done(data => {
      console.log(data);
      document.getElementById('mute-select').value = '';
    })
    .fail(err => {
      console.log(err);
    });
  });
}
function loadUnmutedCategories(muted_categories){
  let categoriesTemp = categories;
  for(var i=0; i< muted_categories.length; i++){
    let x = categoriesTemp.indexOf(muted_categories[i]);
    if(x!=-1){
      categoriesTemp.splice(x, 1);
    }
  }
  let html = `<select class="mute-select" id="mute-select">`;
  for(var i=0; i<categoriesTemp.length; i++){
    html += `<option value="${categoriesTemp[i]}">${categoriesTemp[i]}</option>`
  }
  html += `</select>`;
  $('.mute-box').html(html);
  $("select").material_select();
  $('#save_mute').click(() => {
    $.post(`/mute`, {
      topic: document.getElementById('mute-select').value
    })
    .done(data => {
      console.log(data);
      document.getElementById('mute-select').value = '';
      location.reload();
    })
    .fail(err => {
      console.log(err);
      location.reload();
    });
  });
}
function loadNotifications(notifications) {

  console.log(muted_categories)
  notifications.map(notification => {
    if(muted_categories.indexOf(notification.category) == -1){
      let html = `
        <div class="card">
            <div class="card-block">
                <h4 class="card-title">${notification.title}</h4>
                <p class="card-text">${notification.description}</p>
                <label for="category-edit">Category: </label>

                <span class="category">${notification.category}</span>
            </div>
        </div>
      `;
      /*
        in case editing is required
        ${isAdmin?
          returnSelectOptionString(notification.category):
        }
        <br>
        ${
          isAdmin?
          `<button data-id=${notification.id} class="btn btn-primary save">Save</button>
          <button data-id=${notification.id} class="btn btn-primary notify">Notify</button>
          ` : `<span class="category">${notification.category}</span>`
        }
      */
      let notificationHTML = document.createElement('div');
      notificationHTML.setAttribute('class', 'notification  col-lg-4 col-md-6 col-sm-6 col-xs-12');
      notificationHTML.innerHTML = html;
      let notificationContainer = document.querySelector('.notifications-container');
      notificationContainer.appendChild(notificationHTML);
    }else{
      console.log(notification.category);
    }
  })
}
$('.save').click((e) => {
  let notificationId = e.target.getAttribute('data-id');
});
$('.notify').click((e) => {
  let notificationId = e.target.getAttribute('data-id');
});
$('.create').click((e) => {
  let title = $('#create-card-title').val();
  let description = $('#create-card-description').val();
  let category = $('#category-create').val();
  $('#create-card-title').val('');
  $('#create-card-description').val('');
  $('#category-create').val('');
  if (!title || !description || !category) {
    return;
  }
  if(isAdmin){
    $.post('/notification', {
        title,
        description,
        category
      })
      .done(data => {
        console.log(data);
        location.reload();
      })
      .fail(err => {
        console.log(err);
        location.reload();
      }) 
  }else{
    $.post('/notification_token', {
        title,
        description,
        category
      })
      .done(data => {
        console.log(data);
        alert('The notification would be published once the admin approves!');
        location.reload();
      })
      .fail(err => {
        console.log(err);
        location.reload();
      })
  }
  //post to create notification, refresh page
});
$('.category-filter').change(() => {
  filterAndDisplayNotifications($('select.category-filter').val());
})

function filterAndDisplayNotifications(value) {
  let notificationContainer = document.querySelector('.notifications-container');
  notificationContainer.innerHTML = '';
  notifications.map(notification => {
    if ((notification.category != value) && value != 'all') {
      return;
    }
    let html = `
      <div class="card">
          <div class="card-block">
              <h4 class="card-title">${notification.title}</h4>
              <p class="card-text">${notification.description}</p>
              <label for="category-edit">Category: </label>
              ${isAdmin?
                returnSelectOptionString(notification.category)
                :
                `<span class="category">${notification.category}</span>`
              }
              <br>
              ${
                isAdmin?
                `<button data-id=${notification.id} class="btn btn-primary save">Save</button>
                <button data-id=${notification.id} class="btn btn-primary notify">Notify</button>
                ` : ``
              }
          </div>
      </div>
    `;

    let notificationHTML = document.createElement('div');
    notificationHTML.setAttribute('class', 'notification col-lg-4 col-md-6 col-sm-6 col-xs-12');
    notificationHTML.innerHTML = html;
    notificationContainer.appendChild(notificationHTML);
    $(notificationContainer).find("select").material_select();
  });

}

$('#save_new_category').click(() => {
  let categoryName = $('#new_category').val();
  console.log(categoryName);
  $('#new_category').val('');
  $.post('/category', {
      name: categoryName
    })
    .done(data => {
      console.log(data);
      if (data.success) location.reload();
      else alert("Unable to create category");
    })
    .fail(err => {
      console.log(err);
    })

});

function returnSelectOptionString(defaultValue) {
  console.log(defaultValue);
  let html = "";
  html += `<select id="category-edit" class="category">`
  for (i = 0; i < categories.length; i++) {
    if(categories[i] === defaultValue){
      html += `<option value="${categories[i]}" selected>${categories[i]}</option>`
    }else{
      html += `<option value="${categories[i]}">${categories[i]}</option>`
    }
  }
  html += `</select>`;
  //console.log(html);
  return html;
}
