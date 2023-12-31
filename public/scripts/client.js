const teamContainer = document.querySelector(".our-team__members");
const servicesContainer = document.querySelector(".services__inner")
const publicationsContainer = document.querySelector(".publications__list")

fetch("http://localhost:3000/landing/get")
  .then((response) => response.json())
  .then((data) => {
    processTeamMembers(data.members);
    processArticles(data.services)
    processPublications(data.publications)

    
    animateItems()
  })
  .catch((error) => console.error(error));

document.querySelector(".button--show-publications").addEventListener("click", () => {
    document.querySelector(".publications__inner").classList.toggle("hide-items");
  });

document.querySelector(".edit-mark__search").addEventListener("focus", () => {
  document.querySelector(".marks-list").classList.remove("hidden");
});

// Анимации
// Функция, которая добавляет класс 'visible' к элементу при его появлении в поле зрения
function revealOnScroll(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target); // Отменить наблюдение после появления элемента
    }
  });
}

let delayCounter = 0; // Глобальный счётчик для управления задержкой

// Создание экземпляра IntersectionObserver
let observer = new IntersectionObserver(revealOnScroll, {
  threshold: 0.2, // Можно настроить порог видимости
});

// Применение наблюдателя
observer.observe(document.querySelector(".hero__title"));

function animateItems(){
  document.querySelectorAll(".service").forEach((card) => {
    observer.observe(card);
  });

  document.querySelectorAll(".our-team__member").forEach((card) => {
    observer.observe(card);
  });

  document.querySelectorAll(".publications__item").forEach((item, index) => {
    // Проверка, что элемент не скрыт
    if (window.getComputedStyle(item)) {
      let observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                entry.target.classList.add("visible");
              }, index * 150); // Здесь 150 мс - базовая задержка
  
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
  
      observer.observe(item);
    }
  });
}

document.querySelectorAll(".ellipses").forEach((item, index) => {
  // Проверка, что элемент не скрыт
  if (window.getComputedStyle(item)) {
    let observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, 750);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(item);
  }
});

// Исчезающий хедер

let lastScrollTop = 0;
let header = document.querySelector(".header");

window.addEventListener("scroll", function () {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    // Scrolling down, hide the header
    header.classList.add("hide");
  } else {
    // Scrolling up, show the header
    header.classList.remove("hide");
  }

  lastScrollTop = scrollTop;
});

// Плавный скролл

const smoothLinks = document.querySelectorAll('a[href^="#"]');
for (let smoothLink of smoothLinks) {
  smoothLink.addEventListener("click", function (e) {
    e.preventDefault();
    const id = smoothLink.getAttribute("href");

    document.querySelector(id).scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

// Перевод

function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: "en",
      includedLanguages: "en,pt",
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    },
    "google_translate_element"
  );
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".edit-mark__burger")) {
    document.querySelector(".marks-list").classList.toggle("hidden");
  }
})

// Загрузка элементов страницы
function processArticles(articles) {
  articles.forEach((item) => {
    const article = document.createElement("article")
    const img = document.createElement("img")
    const textWrapper = document.createElement("div")
    const title = document.createElement("h3")
    const description = document.createElement("p")

    article.className = "service"
    textWrapper.className = "service__text"

    article.id = item.id
    img.src = item.img
    title.innerHTML = item.title
    description.innerHTML = item.description
    
    textWrapper.append(title,description)
    article.append(img,textWrapper)
    servicesContainer.append(article)
  })
}

function processTeamMembers(members) {
  members.forEach((member) => {
    const memberArticle = document.createElement("article")
    const image = document.createElement("img")
    const name = document.createElement("h3")
    const position = document.createElement("p")
    const description = document.createElement("p")
    const articleWrapper = document.createElement("div")

    memberArticle.className = "our-team__member"
    memberArticle.id = member.id
    position.className = "our-team__member-position"
    description.className = "our-team__member-bio"
    articleWrapper.className = "our-team__member-wrapper"
   
    image.src = member.photo
    name.innerHTML = member.name
    position.innerHTML = member.position
    description.innerHTML = member.description

    articleWrapper.append(name, position,description)

    memberArticle.append(image,articleWrapper)
    teamContainer.appendChild(memberArticle);
  });
}

function processPublications(publications) {
  publications.forEach((item) => {
    let publication = document.createElement("li")
    publication.className = "publications__item"
    publication.innerHTML = item.description
    publication.id = item.id
    publicationsContainer.append(publication)
  })
}
