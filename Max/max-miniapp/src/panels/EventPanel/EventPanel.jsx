import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Panel,
  Container,
  Flex,
  Typography,
  CellList,
  CellSimple,
  CellAction,
  Avatar,
  IconButton,
  Button,
  Grid,
  Spinner,
} from "@maxhub/max-ui";
import {
  Icon24CopyOutline,
  Icon24DoneOutline,
  Icon24ErrorCircleFillRed,
  Icon24Qr,
  Icon24SadFaceOutline,
  Icon24ScanViewfinderOutline,
  Icon24ShareOutline,
  Icon24TrashSimpleOutline,
  Icon28LinkCircleOutline,
} from "@vkontakte/icons";
import {
  deleteEvent,
  getEvent,
  checkRegister,
  unregister,
} from "../../api/requests";
import { CopyToClipboard } from "react-copy-to-clipboard";
import qr from "@vkontakte/vk-qr";
import { Users } from "./components/Users";

export const EventPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const eventId = location.state?.id ?? null;
  const userRole = location.state?.role ?? "participant";
  const [event, setEvent] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUnregisterDialog, setShowUnregisterDialog] = useState(false);
  const [user, setUser] = useState({
    avatar:
      "https://sun9-21.userapi.com/1N-rJz6-7hoTDW7MhpWe19e_R_TdGV6Wu5ZC0A/67o6-apnAks.jpg",
    fullName: "Иван Иванов",
    first_name: "Иван",
    last_name: "Иванов",
  });
  const [platform, setPlatform] = useState(window.WebApp.platform);
  const text = `${eventId}_${window.WebApp.initDataUnsafe.user.id}`;
  // const text = `{"event_id":"${eventId}","user_id": 6782108}`;
  const qrSvg = qr.createQR(text, 256, "qr-code", {});
  const [showQR, setShowQR] = useState(false);
  // const [scanData, setScanData] = useState(null);
  const [scanError, setScanError] = useState(-1);
  const [scanUser, setScanUser] = useState(null);

  const convertToDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(date);
  };

  useEffect(() => {
    if (window.WebApp.initDataUnsafe.user)
      setUser({
        avatar: window.WebApp.initDataUnsafe.user.photo_url,
        first_name: window.WebApp.initDataUnsafe.user.first_name,
        last_name: window.WebApp.initDataUnsafe.user.last_name,
        fullName: `${window.WebApp.initDataUnsafe.user.first_name} ${window.WebApp.initDataUnsafe.user.last_name}`,
      });
    const fetchData = async () => {
      const response = await getEvent(eventId);
      // console.log(response.data);
      setEvent(response.data.event);
    };
    fetchData();
    // console.log(platform);
  }, []);

  useEffect(() => {
    const backButtonApi = window?.WebApp?.BackButton;
    if (!backButtonApi) {
      return;
    }

    const handleBack = () => navigate("/");

    backButtonApi.show?.();
    backButtonApi.onClick?.(handleBack);

    return () => {
      backButtonApi.offClick?.(handleBack);
      backButtonApi.hide?.();
    };
  }, [navigate]);

  const removeEvent = async () => {
    const response = await deleteEvent(event.id);
    if (response.status === 200) {
      navigate("/");
    }
  };

  const unregisterUser = async () => {
    const response = await unregister(event.id);
    if (response.status === 200) {
      navigate("/");
    }
  }

  const handleShare = () => {
    const payload = {
      text: event.title,
      link: `https://max.ru/t159_hakaton_bot?start=${event.id}`,
    };
    window.WebApp.shareMaxContent(payload);
  };

  const handleOpenCodeReader = async () => {
    if (!window?.WebApp?.openCodeReader) {
      console.warn(
        "openCodeReader is not available in the current environment"
      );
      return;
    }

    try {
      setScanError(-1);
      const result = await window.WebApp.openCodeReader(true);
      // console.log(result.value);

      if (!result) {
        // setScanData(null);
        return;
      }

      if (typeof result === "string") {
        setScanError(1);
        return;
      }

      try {
        const data = result?.value.split("_");
        // console.log(data);
        // console.log(data.length);
        if (data.length !== 2) {
          setScanError(1);
          return;
        }
        if (data[0] !== eventId) {
          setScanError(2);
          return;
        }
        // setScanData({ event_id: data[0], user_id: data[1] });
        const response = await checkRegister({
          event_id: data[0],
          user_id: data[1],
        });
        if (response.status === 403) {
          setScanError(2);
          return;
        }
        if (response.status === 200) {
          // console.log(response.data);
          setScanUser(response.data.user);
          setScanError(0);
        }
      } catch (error) {
        console.log(error);
        setScanError(1);
      }
    } catch (error) {
      console.error("Failed to read QR code", error);
    }
  };

  const renderAction = () => {
    if (userRole === "participant") {
      return (
        <IconButton
          appearance="themed"
          aria-label="Открыть QR"
          mode="primary"
          size="medium"
          onClick={() => {
            setShowQR((showQR) => !showQR);
          }}
        >
          <Icon24Qr />
        </IconButton>
      );
    } else {
      if (platform !== "web") {
        return (
          <IconButton
            appearance="themed"
            aria-label="Открыть камеру"
            mode="primary"
            size="medium"
            onClick={handleOpenCodeReader}
          >
            <Icon24ScanViewfinderOutline />
          </IconButton>
        );
      }
    }
    return null;
  };

  const scanResult = () => {
    if (scanError === -1) return null;
    else if (scanError === 1) {
      return (
        <CellSimple
          before={<Icon24ErrorCircleFillRed />}
          after={
            <Button
              mode="secondary"
              size="medium"
              onClick={() => setScanError(-1)}
            >
              Закрыть
            </Button>
          }
          title="Ошибка чтения"
        />
      );
    } else if (scanError === 2) {
      return (
        <CellSimple
          before={<Icon24SadFaceOutline />}
          after={
            <Button
              mode="secondary"
              size="medium"
              onClick={() => setScanError(-1)}
            >
              Ok
            </Button>
          }
          title="Участник не найден"
        />
      );
    } else {
      return (
        <CellSimple
          before={
            <Avatar.Container size={56}>
              <Avatar.Image
                fallback={(
                  scanUser.first_name.charAt(0) + scanUser.last_name.charAt(0)
                ).toUpperCase()}
                src={scanUser.avatar}
              />
            </Avatar.Container>
          }
          after={
            <Button
              mode="secondary"
              size="medium"
              onClick={() => setScanError(-1)}
            >
              Ok
            </Button>
          }
          title={`${scanUser.first_name} ${scanUser.last_name}`}
        />
      );
    }
  };

  if (!event)
    return (
      <Panel>
        <Spinner appearance="primary" size={50} />
      </Panel>
    );

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
              {renderAction()}
            </Flex>
            {showQR && (
              <Container
                className="qr"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
                style={{
                  backgroundColor: "white",
                  padding: "10px",
                  borderRadius: "10px",
                }}
              ></Container>
            )}
            {scanResult()}
          </Flex>
        </Container>
        {event && (
          <Container>
            <Flex direction="column" gap={8}>
              <Typography.Headline variant="large-strong">
                {event.title}
              </Typography.Headline>
            </Flex>
          </Container>
        )}

        {userRole === "creator" && (
          <Container>
            <Grid cols={2} gap={12}>
              <CopyToClipboard
                text={`https://max.ru/t159_hakaton_bot?start=${eventId}`}
                onCopy={() => {
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                  }, 2000);
                }}
              >
                <IconButton mode="secondary" size="large">
                  {!copied ? <Icon24CopyOutline /> : <Icon24DoneOutline />}
                </IconButton>
              </CopyToClipboard>
              <IconButton
                mode="secondary"
                size="large"
                onClick={() => handleShare()}
              >
                <Icon24ShareOutline />
              </IconButton>
            </Grid>
          </Container>
        )}

        {event && (
          <CellList filled mode="island">
            <CellSimple title="Описание" subtitle={event.description} />
            <CellSimple
              title="Дата и время проведения"
              subtitle={convertToDate(event.datetime)}
            />
            <CellSimple title="Место проведения" subtitle={event.location} />
            <CellAction
              before={<Icon28LinkCircleOutline />}
              height="normal"
              mode="primary"
              onClick={() => {}}
              showChevron
            >
              {event.link}
            </CellAction>
          </CellList>
        )}
        {userRole === "creator" && (
          <Users
            eventId={eventId}
            userId={window.WebApp.initDataUnsafe.user.id}
          />
        )}
        {userRole === "creator" && (
          <Container>
            {!showDeleteDialog ? (
              <Button
                iconBefore={<Icon24TrashSimpleOutline />}
                appearance="negative"
                mode="secondary"
                onClick={() => {
                  setShowDeleteDialog(true);
                }}
                size="large"
              >
                Удалить
              </Button>
            ) : (
              <Grid cols={2} gap={12}>
                <Button
                  size="large"
                  onClick={() => {
                    removeEvent();
                  }}
                >
                  Да
                </Button>
                <Button
                  size="large"
                  appearance="neutral"
                  onClick={() => {
                    setShowDeleteDialog(false);
                  }}
                >
                  Нет
                </Button>
              </Grid>
            )}
          </Container>
        )}
        {userRole === "participant" && event.status === 0 && (
          <Container>
            {!showUnregisterDialog ? (
              <Button
                iconBefore={<Icon24TrashSimpleOutline />}
                appearance="negative"
                mode="secondary"
                onClick={() => {
                  setShowUnregisterDialog(true);
                }}
                size="large"
              >
                Не пойду
              </Button>
            ) : (
              <Grid cols={2} gap={12}>
                <Button
                  size="large"
                  onClick={() => {
                    unregisterUser();
                  }}
                >
                  Да
                </Button>
                <Button
                  size="large"
                  appearance="neutral"
                  onClick={() => {
                    setShowUnregisterDialog(false);
                  }}
                >
                  Нет
                </Button>
              </Grid>
            )}
          </Container>
        )}
      </Flex>
    </Panel>
  );
};
