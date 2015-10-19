---
# Main JS file
---

$ ->

  $('.wrap').click ->
    $('#sidebar-checkbox').prop 'checked', false


  $('.sidebar-nav-item').hover ->
    $this = $ this
    geekTitle = $this.data 'geekTitle'
    normalTitle = $this.prop 'title'

    if $this.text().trim() == normalTitle
      $this.text geekTitle
    else
      $this.text normalTitle


  $('.social-panel .share-link').click (ev) ->
    ev.preventDefault()
    location = $(this).prop 'href'
    window.open location, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600'
