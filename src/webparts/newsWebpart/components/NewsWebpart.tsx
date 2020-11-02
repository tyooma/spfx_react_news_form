import * as React from 'react';
import styles from './NewsWebpart.module.scss';
import "../components/NewsBlock.scss";
import { INewsWebpartProps } from './INewsWebpartProps';
import {
    DefaultButton,
    TextField,
    Checkbox,
    Stack,
    IStackTokens,
    Icon
  } from 'office-ui-fabric-react';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { DateTimePicker, DateConvention } from '@pnp/spfx-controls-react/lib/dateTimePicker';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";

const stackTokens: IStackTokens = { childrenGap: 10 };

export const NewsWebpart: React.FunctionComponent<INewsWebpartProps> = props =>  {
  const [items, setItems] = React.useState([]);
  const [newsTitle, setNewsTitle] = React.useState("");
  const [newsDescription, setNewsDescription] = React.useState("");
  const [newsIsVisible, setNewsIsVisible] = React.useState(true);
  const [newsDate, setNewsDate] = React.useState<Date>();
  const [newsAssignedPerson, setNewsAssignedPerson] = React.useState("");
  const [userOrder, setUserOrder] = React.useState(true);
  const [dateOrder, setDateOrder] = React.useState(true);
  const [isUpdate, setIsUpdate] = React.useState(true);
  const [nonVisible, setNonVisible] = React.useState(false);
  const [tempTitle, setTempTitle] = React.useState("");
  const [tempDescription, setTempDescription] = React.useState("");

  const getItemsFromServer = async () => {
    let itemsFromServer: any[] = await sp.web.lists.getByTitle("News").items.select("Title", "NewsDescription", "IsVisible", "DatePublishing", "AssignedPerson/Title", "Id").expand("AssignedPerson").get();
    itemsFromServer = itemsFromServer.map(item => {
      item["isEdit"] = false;
      return item;
    });
    setItems(itemsFromServer);
  };

  React.useEffect(() => {
    getItemsFromServer();
    console.log(items);
  }, [isUpdate]);

  const onChangeTitle = (event): void => {
    setNewsTitle(event.target.value);
  };

  const onChangeDescription = (event): void => {
    setNewsDescription(event.target.value);
  };

  const onChangeIsVisible = (ev: React.FormEvent<HTMLElement>, checked: boolean): void => {
    setNewsIsVisible(!!checked);
  };

  const onChangeDate = (event): void => {
    setNewsDate(event);
  };

  const onChangeAssignedPerson = (user: any[]): void => {
    setNewsAssignedPerson(user[0].id);
  };

  const sortByUsers = (): void => {
    userOrder
      ? setItems(prevState => prevState.sort((a, b) => {
        return a.AssignedPerson.Title.localeCompare(b.AssignedPerson.Title);
      }))
      : setItems(prevState => prevState.sort((a, b) => {
        return b.AssignedPerson.Title.localeCompare(a.AssignedPerson.Title);
      }));

    setUserOrder(prevState => !prevState);
  };

  const sortByDate = (): void => {
    dateOrder
      ? setItems(prevState => prevState.sort((a, b) => {
        return a.DatePublishing.localeCompare(b.DatePublishing);
      }))
      : setItems(prevState => prevState.sort((a, b) => {
        return b.DatePublishing.localeCompare(a.DatePublishing);
      }));

    setDateOrder(prevState => !prevState);
  };

  const onChangeNonVisible = (ev: React.FormEvent<HTMLElement>, checked: boolean): void => {
    setNonVisible(!!checked);
  };

  const addItemToTheList = async () => {
    await sp.web.lists.getByTitle("News").items.add({
      Title: newsTitle,
      NewsDescription: newsDescription,
      IsVisible: newsIsVisible,
      DatePublishing: newsDate,
      AssignedPersonId: newsAssignedPerson,
    });
    setNewsTitle("");
    setNewsDescription("");
    setNewsIsVisible(true);
    setNewsDate(null);
    setNewsAssignedPerson(null);

    setIsUpdate(prevState => !prevState);
  };

  const deleteItemFromList = async (id: number) => {
    await sp.web.lists.getByTitle("News").items.getById(id).delete();

    setIsUpdate(prevState => !prevState);
  };

  const onEditStart = (id: number) => {
    setItems(items.map(item => {
      if (item.Id === id) {
        item.isEdit = !item.isEdit

        setTempTitle(item.Title);
        setTempDescription(item.NewsDescription);

        return item;
      } 
      return item;
    }));
  };

  const onEditTitle = (event) => {
    setTempTitle(event.target.value);
  };

  const onEditDescription = (event) => {
    setTempDescription(event.target.value);
  };

  const saveEditItem = async (id: number) => {
    await sp.web.lists.getByTitle("News").items.getById(id).update({
      Title: tempTitle,
      NewsDescription: tempDescription
    });

    console.log(tempTitle);

    setIsUpdate(prevState => !prevState);
  };

  const cancelEditItem = (id: number) => {
    setItems(items.map(item => {
      if (item.Id === id) {
        item.isEdit = !item.isEdit

        return item;
      } 
      return item;
    }));
  };

  return (
    <div className={ styles.newsWebpart }>
      <div className={ styles.container }>
        <div className={ styles.row }>
          <div className={ styles.column }>
            <h2 className={ styles.title }>Create post</h2>
            <Stack tokens={stackTokens}>
              <TextField
                label="Title"
                placeholder="Enter a title"
                required
                value={newsTitle}
                onChange={onChangeTitle}
              />
              <TextField
                label="Description"
                placeholder="Write a description"
                multiline
                autoAdjustHeight
                value={newsDescription}
                onChange={onChangeDescription}
              />
              <Checkbox
                label="Is visible"
                checked={newsIsVisible}
                onChange={onChangeIsVisible}
              />
              <DateTimePicker
                dateConvention={DateConvention.Date}
                value={newsDate}
                onChange={onChangeDate}
                placeholder="Select date"
              />
              <PeoplePicker
                context={props.context}
                personSelectionLimit={1}
                titleText="Assigned person"
                required={true}
                onChange={onChangeAssignedPerson}
                showHiddenInUI={false}
                principalTypes={[PrincipalType.User]}
                ensureUser={true}
                resolveDelay={1000}
                placeholder="Select user"
              />
              <DefaultButton
                text="OK"
                className="button"
                onClick={addItemToTheList}
              />
            </Stack>
            <hr className="hr" />
            <div className="news">
              <h2 className="news__head">Latest news</h2>
              <div className="news__filters">
                <h3 className="news__filters_title">Filter by</h3>
                <button className="news__filters_btn" onClick={sortByUsers}>User &#8593; &#8595;</button>
                <button className="news__filters_btn" onClick={sortByDate}>Date &#8593; &#8595;</button>
              </div>
              <div className="news__non-visible">
                <Checkbox
                  label="Show non-visible"
                  checked={nonVisible}
                  onChange={onChangeNonVisible}
                />
              </div>
              {items.map(item => (
                nonVisible
                ? (
                    <div className="news__item" >
                      <div className="news__icons">
                        <Icon
                          iconName="Edit"
                          className="news__edit"
                          onClick={() => onEditStart(item.Id)}
                        />
                        <Icon
                          iconName="Delete"
                          className="news__delete"
                          onClick={() => deleteItemFromList(item.Id)}
                        />
                      </div>
                      {
                        item.isEdit
                        ? (
                          <div className="news__editor">
                            <TextField
                              placeholder="Edit the title"
                              required
                              value={tempTitle}
                              onChange={onEditTitle}
                              className="news__editor-title"
                            />
                            <TextField
                              placeholder="Edit the description"
                              multiline
                              autoAdjustHeight
                              value={tempDescription}
                              onChange={onEditDescription}
                              className="news__editor-description"
                            />
                            <button className="news__editor-btn" onClick={() => saveEditItem(item.Id)}>Save</button>
                            <button className="news__editor-btn" onClick={() => cancelEditItem(item.Id)}>Cancel</button>
                          </div>
                        )
                        : ""
                      }
                      <h3 className="news__title">{item.Title}</h3>
                      <p className="news__description" >{item.NewsDescription}</p>
                      <div className="news__info">
                        <p className="news__user">
                          <span className="news__user_span">by </span>
                          {item.AssignedPerson.Title}
                        </p>
                        <p className="news__slash">|</p>
                        <p className="news__date" >{item.DatePublishing.substr(0, 10)}</p>
                        <p className="news__slash">|</p>
                        <div className="news__visibility">
                          <p className="news__visibility-text">visibility</p>
                          {
                            item.IsVisible
                            ? <div className="news__green"></div>
                            : <div className="news__red"></div>
                          }
                        </div>
                      </div>
                    </div>
                )
                : item.IsVisible 
                  ? (
                    <div className="news__item" >
                      <div className="news__icons">
                        <Icon
                          iconName="Edit"
                          className="news__edit"
                          onClick={() => onEditStart(item.Id)}
                        />
                        <Icon
                          iconName="Delete"
                          className="news__delete"
                          onClick={() => deleteItemFromList(item.Id)}
                        />
                      </div>
                      {
                        item.isEdit
                        ? (
                          <div className="news__editor">
                            <TextField
                              placeholder="Edit the title"
                              required
                              value={tempTitle}
                              onChange={onEditTitle}
                              className="news__editor-title"
                            />
                            <TextField
                              placeholder="Edit the description"
                              multiline
                              autoAdjustHeight
                              value={tempDescription}
                              onChange={onEditDescription}
                              className="news__editor-description"
                            />
                            <button className="news__editor-btn" onClick={() => saveEditItem(item.Id)}>Save</button>
                            <button className="news__editor-btn" onClick={() => cancelEditItem(item.Id)}>Cancel</button>
                          </div>
                        )
                        : ""
                      }
                      <h3 className="news__title">{item.Title}</h3>
                      <p className="news__description" >{item.NewsDescription}</p>
                      <div className="news__info">
                        <p className="news__user">
                          <span className="news__user_span">by </span>
                          {item.AssignedPerson.Title}
                        </p>
                        <p className="news__slash">|</p>
                        <p className="news__date" >{item.DatePublishing.substr(0, 10)}</p>
                        <p className="news__slash">|</p>
                        <div className="news__visibility">
                          <p className="news__visibility-text">visibility</p>
                          {
                            item.IsVisible
                            ? <div className="news__green"></div>
                            : <div className="news__red"></div>
                          }
                        </div>
                      </div>
                    </div>
                )
                  : ""
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
