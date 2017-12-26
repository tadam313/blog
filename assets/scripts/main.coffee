---
# Main coffee file
---

$ ->
  # close side bar on body click
  $('.wrap').click ->
    $('#sidebar-checkbox').prop 'checked', false

  # handle social share buttons
  $('.social-panel .share-link').click (ev) ->
    ev.preventDefault()
    location = $(this).prop 'href'
    window.open location, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600'
