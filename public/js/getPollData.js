$(document).ready(function() {

  var urlParams = window.location.pathname.split('/');
  var username  = urlParams[1];
  var pollID    = urlParams[3];

  $.ajax({
    url: `${window.location.origin}/api/${username}/polls/${pollID}`,
    method: 'GET',
    success: function(data) {
      console.log(data)
      $('.poll-title').html(data.poll.name);
      var ctx = document.getElementById("myChart").getContext('2d');
      var chartObj = {
        type: 'horizontalBar',
        data: {
            labels: data.poll.options.map(function(option) { return option.name }),
            datasets: [{
                label: 'Poll Results',
                data: data.poll.options.map(function(option) { return option.votes }),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)'
                ]
            }]
        },
        options: {
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                userCallback: function(label, index, labels) {
                  if (Math.floor(label) === label) {
                    return label;
                  }
                },
              }
            }],
          },
       }
      }
      var myChart = new Chart(ctx, chartObj);
    }
  });

});