var map;

//Setting up all my locations
var initialLocations = [
   {
    title: 'Gold Museum', 
    location: {
      lat: 4.60115 ,
      lng: -74.072965
    }
  },
  {
    title: 'Colombian National Museum',
    location: {
      lat: 4.615618,
      lng: -74.069007
    }
  },
  {
    title: 'Monserrate Sanctuary',
    location: {
      lat: 4.605833,
      lng: -74.056389

    }
  },
  {
    title: 'La Candelaria',
    location: {
      lat: 4.597014,
      lng: -74.072876
    }
  },
  {
    title: 'Bogotá Museum of Modern Art',
    location: {
      lat: 4.6101393,
      lng: -74.07147
    }
  }
];

function initMap() {

  var bounds = new google.maps.LatLngBounds();

//My viewmodel starts here
  var viewModel = function () {

    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 4.652896, lng: -74.054229},
      zoom: 4
    });

    var self = this;

    self.locations = ko.observableArray(initialLocations);

    // create makers
    for (var i = 0; i < initialLocations.length; i++) {
      var marker = new google.maps.Marker({
        map: map,
        position: initialLocations[i].location,
        title: initialLocations[i].title,
        animation: google.maps.Animation.DROP,
      });

      initialLocations[i].marker= marker;

      var largeInfowindow = new google.maps.InfoWindow();

      marker.addListener('click', function () {
        populateInfoWindow(this, largeInfowindow);
      });

      bounds.extend(initialLocations[i].marker.position);
    }

    map.fitBounds(bounds);

    // input search locations
    self.query= ko.observable('');

    self.sitesFilter = ko.computed(function(site) {
      var search = self.query().toLowerCase();
      if (!search) {
        for (var i = 0; i < initialLocations.length; i++)
          initialLocations[i].marker.setVisible(true);

        return self.locations();
      } 
      else {
        return ko.utils.arrayFilter(self.locations(), function(site) {
          site.title = site.title.toLowerCase();
          filtered = filter(site.title, search);
          if (filtered) site.marker.setVisible(true);
          else site.marker.setVisible(false);
          return filtered
        });
      }
    }, self);

  };
  ko.applyBindings(new viewModel());
}

function filter (site, letters) {
  site = site || '';
  if (letters.length > site.length) return false;
  return site.substring(0, letters.length) === letters;
};

function populateInfoWindow(marker, infowindow) {

  if (marker.getAnimation() !== null) marker.setAnimation(null);
  else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null); }, 2100);
  }

  if (infowindow.marker != marker) {

    var encodeName = encodeURI(marker.title);
    var wikiUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + encodeName + "&limit=1&redirects=return&format=json"

    $.ajax ({
      url: wikiUrl,
      dataType: "jsonp"
    })
    .done(function (response) {
      var articleList = response[1];
        if (articleList.length > 0) {
          for (var i=0; i<articleList.length; i++) {
            articleStr = articleList[i];
            var url = 'http://en.wikipedia.org/wiki/' + articleStr;
            var contentWindow = '<div id="content">' + marker.title +
                                  '<p>' + response[2] + '</p>' +
                                  '<a href=" ' + url + '">' + url + '</a>' +
                                '</div>';
            infowindow.setContent(contentWindow);
            // console.log(response);
          }
        } else {
          contentWindow = '<div id="content">' + marker.title +
                            '<p>' + 'Sorry, no articles in wikipedia'+ '</p>' +
                          '</div>'
          infowindow.setContent(contentWindow);
        }
    })
    .error(function(e){
      contentWindow = '<div id="content">' + marker.title +
                        '<p>' + 'Opps, wikipedia is not working' + '</p>' +
                      '</div>'
      infowindow.setContent(contentWindow);

    });

    infowindow.open(map, marker);
  }
}

function googleError() {
  alert("Oops, something happened map is not ready...");  
}