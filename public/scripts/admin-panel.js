const servicesContainer = document.querySelector(".services__inner");
const publicationsContainer = document.querySelector(".publications__list");
const teamContainer = document.querySelector(".our-team__members");
const editServiceForm = document.querySelector("#edit-service-form");
const newTitle = document.querySelector("#new-title");
const newDescription = document.querySelector("#new-description");
const buttonEditArticle = document.querySelector("#button--edit-article");
const addServiceForm = document.querySelector("#add-service-form");
const buttonAddArticle = document.querySelector("#button--add-article");
const titleInput = document.querySelector("#title");
const descriptionInput = document.querySelector("#description");
const linkInput = document.querySelector("#link");
const addPublicationForm = document.querySelector("#add-publication-form");
const buttonAddPublication = document.querySelector("#button--add-publication");
const publicationInput = document.querySelector("#publication");
const editMemberForm = document.querySelector("#edit-member-form");
const newName = document.querySelector("#new-name");
const newPosition = document.querySelector("#new-position");
const newBio = document.querySelector("#new-bio");
const newPhotoLink = document.querySelector("#new-photo-link");
const buttonEditMember = document.querySelector("#button--edit-member");
const addMemberForm = document.querySelector("#add-member-form");
const buttonAddMember = document.querySelector("#button--add-member");
const nameInput = document.querySelector("#name");
const positionInput = document.querySelector("#position");
const bioInput = document.querySelector("#bio");
const photoLinkInput = document.querySelector("#photo-link");
const newImg = document.querySelector("#new-image");
const newPublication = document.querySelector("#new-publication");
const editPublicationForm = document.querySelector("#edit-publication-form");
const buttonEditPublication = document.querySelector(
  "#button--edit-publication"
);

// Функции для работы с API
function fetchApi(url, method, params) {
  return fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
}

function fetchDelete(objectId) {
  fetchApi("/delete/" + objectId, "DELETE", { id: objectId })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка удаления");
      }
    })
    .catch((error) => console.error("Ошибка:", error));
}

function fetchEdit(params) {
  fetchApi("/landing/edit", "POST", params)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка редактирования");
      }
    })
    .catch((error) => console.error("Ошибка:", error));
}

function fetchAdd(params) {
  fetchApi("/landing/add", "POST", params)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка добавления");
      }
    })
    .catch((error) => console.error("Ошибка:", error));
}

function fetchDrag(params) {
  fetchApi("/landing/drag", "POST", params)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка добавления");
      }
    })
    .catch((error) => console.error("Ошибка:", error));
}

fetch("/landing/get")
  .then((response) => response.json())
  .then((data) => {
    processServices(data.services);
    processPublications(data.publications);
    processTeamMembers(data.members);
  })
  .catch((error) => console.error(error));

function processServices(services) {
  services.forEach((item) => {
    const article = document.createElement("article");
    const img = document.createElement("img");
    const textWrapper = document.createElement("div");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const deleteButton = createButton("delete", "button--delete-article");
    const editButton = createButton("edit", "button--edit-article");

    article.className = "service";
    textWrapper.className = "service__text";

    article.id = item.id;
    img.src = item.img;
    title.innerHTML = item.title;
    description.innerHTML = item.description;

    textWrapper.append(title, description, editButton, deleteButton);
    article.append(img, textWrapper);
    servicesContainer.append(article);
  });
}

function processPublications(publications) {
  publications.forEach((item) => {
    let publication = document.createElement("li");
    let text = document.createElement("p");

    const deleteButton = createButton("delete", "button--delete-publication");
    const editButton = createButton("edit", "button--edit-publication");

    text.innerHTML = item.description;
    publication.className = "publications__item";
    publication.id = item.id;
    publication.draggable = "true";

    publication.append(text, editButton, deleteButton);
    publicationsContainer.append(publication);
  });
}

function processTeamMembers(members) {
  members.forEach((member) => {
    const memberArticle = document.createElement("article");
    const image = document.createElement("img");
    const name = document.createElement("h3");
    const position = document.createElement("p");
    const description = document.createElement("p");
    const deleteButton = createButton("delete", "button--delete-member");
    const editButton = createButton("edit", "button--edit-member");

    memberArticle.className = "our-team__member";
    position.className = "our-team__member-position";
    description.className = "our-team__member-bio";

    image.src = member.photo;
    name.innerHTML = member.name;
    position.innerHTML = member.position;
    description.innerHTML = member.description;
    memberArticle.id = member.id;

    memberArticle.append(
      image,
      name,
      position,
      description,
      editButton,
      deleteButton
    );
    teamContainer.appendChild(memberArticle);
  });
}

function createButton(text, className) {
  const button = document.createElement("button");
  button.textContent = text;
  button.className = className;
  return button;
}

// Обработчики событий
document.addEventListener("click", (e) => {
  if (e.target.className == "button--delete-article") {
    let id = e.target.closest(".service").id;
    fetchDelete(id);
    location.reload();
  }

  if (e.target.className == "button--edit-article") {
    editServiceForm.classList.remove("hidden");
    let articleElement = e.target.closest(".service");
    newTitle.value = articleElement.querySelector("h3").innerHTML;
    newDescription.value = articleElement.querySelector("p").innerHTML;
    newImg.value = articleElement.querySelector("img").src;

    let id = e.target.closest(".service").id;

    buttonEditArticle.addEventListener("click", () => {
      let params = {
        id: id,
        title: newTitle.value,
        description: newDescription.value,
        img: newImg.value,
        type: "services",
      };
      fetchEdit(params);
    });
  }

  if (e.target.className == "button--new-service") {
    addServiceForm.classList.remove("hidden");

    buttonAddArticle.addEventListener("click", () => {
      let params = {
        title: titleInput.value,
        description: descriptionInput.value,
        img: linkInput.value,
        type: "services",
      };
      fetchAdd(params);
    });
  }

  if (e.target.className == "close-form") {
    e.target.closest(".mark-form").classList.add("hidden");
  }

  if (e.target.className == "button--delete-publication") {
    let id = e.target.closest(".publications__item").id;
    fetchDelete(id);
    location.reload();
  }

  if (e.target.className == "button--new-publication") {
    addPublicationForm.classList.remove("hidden");
    buttonAddPublication.addEventListener("click", () => {
      let params = {
        description: publicationInput.value,
        type: "publications",
      };
      fetchAdd(params);
    });
  }

  if (e.target.className == "button--edit-publication") {
    editPublicationForm.classList.remove("hidden");
    let publication = e.target.closest(".publications__item");
    let id = publication.id;
    newPublication.value = publication.querySelector("p").innerHTML;

    buttonEditPublication.addEventListener("click", () => {
      let params = {
        id: id,
        description: newPublication.value,
      };
      fetchEdit(params);
      console.log(params);
    });
  }

  if (e.target.className == "button--delete-member") {
    let id = e.target.closest(".our-team__member").id;
    fetchDelete(id);
    location.reload();
  }

  if (e.target.className == "button--edit-member") {
    editMemberForm.classList.remove("hidden");
    let memberElement = e.target.closest(".our-team__member");
    newName.value = memberElement.querySelector("h3").innerHTML;
    newPosition.value = memberElement.querySelector(
      ".our-team__member-position"
    ).innerHTML;
    newBio.value = memberElement.querySelector(
      ".our-team__member-bio"
    ).innerHTML;
    newPhotoLink.value = memberElement.querySelector("img").src;
    let id = memberElement.id;

    buttonEditMember.addEventListener("click", () => {
      let params = {
        id: id,
        name: newName.value,
        position: newPosition.value,
        description: newBio.value,
        photo: newPhotoLink.value,
        type: "members",
      };
      fetchEdit(params);
      location.reload();
    });
  }

  if (e.target.className == "button--add-member") {
    addMemberForm.classList.remove("hidden");
    buttonAddMember.addEventListener("click", () => {
      let params = {
        name: nameInput.value,
        position: positionInput.value,
        description: bioInput.value,
        photoLink: photoLinkInput.value,
        type: "members",
      };

      fetchAdd(params);
    });
  }
});

// drag and drop
const sortableList = document.querySelector(".publications__list");
let draggedItem = null;
let startIndex = 0;

function getDragIndex(id) {
  const itemIds = Array.from(
    document.querySelectorAll(".publications__item")
  ).map((item) => item.id);

  const itemIndex = itemIds.indexOf(id);
  return itemIndex;
}

sortableList.addEventListener("dragstart", (e) => {
  draggedItem = e.target;
  e.dataTransfer.setData("text/plain", e.target.innerHTML);
  setTimeout(() => {
    e.target.classList.add("dragging");
  }, 0);

  startIndex = getDragIndex(e.target.id);
});

sortableList.addEventListener("dragend", (e) => {
  e.preventDefault();
  draggedItem.classList.remove("dragging");
  draggedItem = null;
  console.log(getDragIndex(e.target.id));
  console.log(startIndex);
  fetchDrag({
    start: startIndex,
    end: getDragIndex(e.target.id),
  });
});

sortableList.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(sortableList, e.clientY);
  const draggable = document.querySelector(".dragging");

  if (afterElement == null) {
    sortableList.appendChild(draggable);
  } else {
    sortableList.insertBefore(draggable, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".publications__item:not(.dragging)"),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
