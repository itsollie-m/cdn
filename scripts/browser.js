(() => {
  const listing = document.getElementById("listing");
  const breadcrumbs = document.getElementById("breadcrumbs");
  const search = document.getElementById("search");
  const count = document.getElementById("count");
  const CDN_ORIGIN = "https://cdn.olliem.dev";
  let root = [];
  let current = [];

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const fileIcon = (name) => {
    const ext = name.split(".").pop().toLowerCase();
    const icons = {
      png:"▧",jpg:"▧",jpeg:"▧",webp:"▧",gif:"▧",svg:"◇",
      css:"✳",js:"⌘",mjs:"⌘",html:"⌗",json:"{}",txt:"≡",
      pdf:"▤",woff:"Aa",woff2:"Aa",ttf:"Aa",otf:"Aa",
      zip:"▣",mp4:"▶",mp3:"♫"
    };
    return icons[ext] || "▤";
  };

  const makeButton = (label, className, onClick) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    if (className) button.className = className;
    button.addEventListener("click", onClick);
    return button;
  };

  function renderBreadcrumbs() {
    breadcrumbs.replaceChildren();
    const home = makeButton("Root", "", () => { current = []; render(); });
    breadcrumbs.append(home);
    let path = [];
    current.forEach((part) => {
      const separator = document.createElement("span");
      separator.textContent = "/";
      breadcrumbs.append(separator);
      path.push(part);
      const target = [...path];
      breadcrumbs.append(makeButton(part, "", () => { current = target; render(); }));
    });
  }

  function findDirectory(parts) {
    let entries = root;
    for (const part of parts) {
      const folder = entries.find((entry) => entry.type === "directory" && entry.name === part);
      if (!folder) return [];
      entries = folder.children || [];
    }
    return entries;
  }

  function makeEntry(entry) {
    const row = document.createElement("div");
    row.className = "item";
    const icon = document.createElement("span");
    icon.className = "item-icon";
    icon.textContent = entry.type === "directory" ? "📁" : fileIcon(entry.name);
    row.append(icon);

    const main = document.createElement("div");
    main.className = "item-main";
    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = entry.name;
    const meta = document.createElement("span");
    meta.className = "item-meta";
    meta.textContent = entry.type === "directory" ? "Folder" : formatSize(entry.size || 0);
    main.append(name, meta);
    row.append(main);

    if (entry.type === "directory") {
      row.style.cursor = "pointer";
      row.addEventListener("click", () => { current = entry.path.split("/"); search.value = ""; render(); });
    } else {
      const url = CDN_ORIGIN + "/" + entry.path.split("/").map(encodeURIComponent).join("/");
      row.append(makeButton("Copy URL", "", async () => {
        try {
          await navigator.clipboard.writeText(url);
          const button = row.querySelector("button");
          button.textContent = "Copied!";
          setTimeout(() => button.textContent = "Copy URL", 1400);
        } catch {
          window.prompt("Copy this file URL:", url);
        }
      }));
      const download = document.createElement("a");
      download.href = url;
      download.download = entry.name;
      download.textContent = "Download";
      row.append(download);
    }
    return row;
  }

  function flatten(entries, output = []) {
    for (const entry of entries) {
      output.push(entry);
      if (entry.type === "directory") flatten(entry.children || [], output);
    }
    return output;
  }

  function renderSearch(query) {
    const matches = flatten(root, []).filter((entry) => entry.name.toLowerCase().includes(query));
    listing.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "No matching files or folders.";
      listing.append(empty);
    } else {
      matches.forEach((entry) => listing.append(makeEntry(entry)));
    }
    count.textContent = matches.length + " matches";
    breadcrumbs.textContent = "Search results across all directories";
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    if (query) return renderSearch(query);
    renderBreadcrumbs();
    const entries = findDirectory(current);
    listing.replaceChildren();
    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "This folder is empty.";
      listing.append(empty);
    } else {
      entries.forEach((entry) => listing.append(makeEntry(entry)));
    }
    count.textContent = flatten(root, []).filter((entry) => entry.type === "file").length + " files";
  }

  search.addEventListener("input", render);

  fetch("/files.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Could not load files.json (" + response.status + ")");
      return response.json();
    })
    .then((manifest) => {
      root = manifest.files || [];
      render();
    })
    .catch((error) => {
      listing.innerHTML = "";
      const message = document.createElement("div");
      message.className = "error";
      message.textContent = "The file directory could not be loaded. " + error.message;
      listing.append(message);
      count.textContent = "Manifest unavailable";
    });
})();
