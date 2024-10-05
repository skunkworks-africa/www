/* General Styles for Header */
.header {
  font-family: 'IBM Plex Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  position: relative;
}

.header h1 {
  font-weight: 700;
  font-size: 20px;
  line-height: 1;
  margin: 6px 0 6px 10px;
  display: inline-block;
  vertical-align: top;
}

.header .menu {
  display: flex;
  align-items: center;
}

.header .menu li {
  list-style: none;
  margin-right: 20px;
}

.header .menu li a {
  text-decoration: none;
  color: #333;
  font-size: 14px;
}

.header .menu li a:hover {
  text-decoration: underline;
}

.header .menu li img.icon {
  width: 24px;
  height: 24px;
  vertical-align: middle;
  margin-right: 8px;
}

/* Burger Menu for Mobile */
.burger-menu {
  display: none;
  cursor: pointer;
  flex-direction: column;
  gap: 4px;
}

.burger-menu div {
  width: 25px;
  height: 3px;
  background-color: #333;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header.open .menu {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .header .menu {
    display: none;
    width: 100%;
  }

  .header .menu li {
    margin: 10px 0;
  }

  .burger-menu {
    display: flex;
  }
}
