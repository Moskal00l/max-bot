import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import {
  Avatar,
  CellList,
  CellSimple,
  Container,
  Flex,
  Grid,
  IconButton,
  Panel,
  Spinner,
  ToolButton,
  Typography,
} from "@maxhub/max-ui";
import {
  Icon24Add,
  Icon24UserPenOutline,
  Icon24UsersOutline,
  Icon24UserSquareOutline,
  Icon56EventOutline,
} from "@vkontakte/icons";
import { getEvents } from "../../api/requests";

export const Home = () => {
  const [role, setRole] = useState("participant");
  const navigate = useNavigate();
  const [events, setEvents] = useState(null);
  const [user, setUser] = useState({
    avatar:
      "https://sun9-21.userapi.com/1N-rJz6-7hoTDW7MhpWe19e_R_TdGV6Wu5ZC0A/67o6-apnAks.jpg",
    fullName: "Иван Иванов",
    first_name: "Иван",
    last_name: "Иванов",
  });

  useEffect(() => {
    if (window.WebApp.initDataUnsafe.user)
      setUser({
        avatar: window.WebApp.initDataUnsafe.user.photo_url,
        first_name: window.WebApp.initDataUnsafe.user.first_name,
        last_name: window.WebApp.initDataUnsafe.user.last_name,
        fullName: `${window.WebApp.initDataUnsafe.user.first_name} ${window.WebApp.initDataUnsafe.user.last_name}`,
      });
    const fetchData = async () => {
      const response = await getEvents();
      // console.log(response.data.events);
      setEvents(response.data.events);
    };
    fetchData();
  }, []);

  const convertToDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(date);
  };

  return (
    <Panel mode="secondary" className="page">
      <Flex direction="column" gap={24} align="stretch">
        <Container className="header">
          <Flex direction="column" align="center" gap={16}>
            <Avatar.Container size={96}>
              <Avatar.Image
                fallback={(
                  user.first_name.charAt(0) + user.last_name.charAt(0)
                ).toUpperCase()}
                src={user.avatar}
              />
            </Avatar.Container>

            <Flex className="details" direction="row" align="center" gap={12}>
              <Typography.Headline variant="large-strong">
                {user.fullName}
              </Typography.Headline>
              <IconButton
                appearance="themed"
                aria-label="Создать событие"
                mode="primary"
                size="medium"
                onClick={() => navigate("/create")}
              >
                <Icon24Add />
              </IconButton>
            </Flex>

            <Grid className="actions" cols={3} gap={8}>
              <ToolButton
                icon={<Icon24UsersOutline />}
                onClick={() => {
                  setRole("participant");
                }}
                appearance={role === "participant" ? "default" : "secondary"}
              >
                Участник
              </ToolButton>

              <ToolButton
                icon={<Icon24UserSquareOutline />}
                onClick={() => {
                  setRole("admin");
                }}
                appearance={role === "admin" ? "default" : "secondary"}
              >
                Администратор
              </ToolButton>

              <ToolButton
                icon={<Icon24UserPenOutline />}
                onClick={() => {
                  setRole("creator");
                }}
                appearance={role === "creator" ? "default" : "secondary"}
              >
                Создатель
              </ToolButton>
            </Grid>
          </Flex>
        </Container>
        {events ? (
          <CellList filled mode="island">
            {events
              .filter((event) => event.role === role)
              .map((event) => (
                <CellSimple
                  key={event.id}
                  before={<Icon56EventOutline />}
                  onClick={() =>
                    navigate("/event", {
                      state: { id: event.id, role: event.role },
                    })
                  }
                  showChevron
                  title={event.title}
                  subtitle={convertToDate(event.datetime)}
                />
              ))}
          </CellList>
        ) : (
          <Flex align="center" justify="center">
            <Spinner appearance="primary" size={50} />
          </Flex>
        )}
      </Flex>
    </Panel>
  );
};
