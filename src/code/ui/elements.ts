export function portalLink(guid: string, name?: string) {
  return $('<a>', {
    title: name || "",
    html: name || '[ Click here to load... ]',
    click: (e: Event) => {
      renderPortalDetails(guid);
      e.stopPropagation();
    },
  });
}
