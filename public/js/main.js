//fetch results
//let isAdmin = true;
/**
 * 
 * let notifications = [
    { 
      id: 1,
      title: 'alpha',
      content: 'beta',
      category: 'exams'
    },
    {
      id: 2,
      title: 'alpha',
      content: 'beta',
      category: 'exams'
    },
    {
      id: 3,
      title: 'alpha',
      content: 'beta',
      category: 'exams'
    }
  ];
 */
$.get('http://localhost:3002/get_notifications')
  .done(data => {
    console.log(data.notifications);
    loadNotifications(data.notifications);
  })
  .fail(err => {
    console.log(err);
  })


function loadNotifications(notifications){
  notifications.map(notification => {
    let html = `
      <div class="card">
          <div class="card-block">
              <h4 class="card-title">${notification.title}</h4>
              <p class="card-text">${notification.description}</p>
              <label for="category-edit">Category: </label>
              ${isAdmin?
                `<select id="category-edit" class="category" value=${notification.category}>
                  <option value="exams">exams</option>
                  <option value="vacations">vacations</option>
                  <option value="celebrations">clebrations</option>
                </select>`:
                `<span class="category">${notification.category}</span>`
              }
              <br>
              <button data-id=${notification.id} class="btn btn-primary save">Save</button>
              <button data-id=${notification.id} class="btn btn-primary notify">Notify</button>
          </div>
      </div>
    `;
    let notificationHTML = document.createElement('div');
    notificationHTML.setAttribute('class', 'notification col-sm-4');
    notificationHTML.innerHTML = html;
    let notificationContainer = document.querySelector('.notifications-container');
    notificationContainer.appendChild(notificationHTML);
    console.log(notificationContainer, notificationHTML);
  })
}
$('.save').click((e) => {
  let notificationId = e.target.getAttribute('data-id');
  console.log('save initiated', notificationId);
});
$('.notify').click((e) => {
  let notificationId = e.target.getAttribute('data-id');
  console.log('Notify initiated', notificationId);
});
$('.create').click((e) => {
  let title = $('#create-card-title').val();
  let description = $('#create-card-description').val();
  let category = $('#category-create').val();
  if(!title || !description || !category ){
    return;
  }
  $.post('http://localhost:3002/notification', {
    title,
    description,
    category
  })
    .done(data => {
      console.log(data);
    })
    .fail(err => {
      console.log(err);
    })
  //post to create notification, refresh page
});
$('.category-filter').change(() => {
  filterAndDisplayNotifications($('.category-filter').val());
})
function filterAndDisplayNotifications(value){
  let notificationContainer = document.querySelector('.notifications-container');
  notificationContainer.innerHTML = '';
  notifications.map(notification => {
    if((notification.category != value) && value != 'all'){
      return;
    }
    let html = `
      <div class="card">
          <div class="card-block">
              <h4 class="card-title">${notification.title}</h4>
              <p class="card-text">${notification.content}</p>
              <label for="category-edit">Category: </label>
              ${isAdmin?
                `<select id="category-edit" class="category" value=${notification.category}>
                  <option value="exams">exams</option>
                  <option value="vacations">vacations</option>
                  <option value="celebrations">clebrations</option>
                </select>`:
                `<span class="category">${notification.category}</span>`
              }
              <br>
              <button data-id=${notification.id} class="btn btn-primary save">Save</button>
              <button data-id=${notification.id} class="btn btn-primary notify">Notify</button>
          </div>
      </div>
    `;

    let notificationHTML = document.createElement('div');
    notificationHTML.setAttribute('class', 'notification col-sm-4');
    notificationHTML.innerHTML = html;
    notificationContainer.appendChild(notificationHTML);
    console.log(notificationContainer, notificationHTML);
  });
}